export interface Size { w: number, h: number }
export interface Rect { x: number, y: number, w: number, h: number }
export interface PartInput { id: string; w: number; h: number; count: number; rotatable: boolean; name: string }
export interface StockInput { id: string; w: number; h: number; count: number }

export interface PlacedPart extends Rect {
  partId: string;
  name: string;
  rotated: boolean;
  originalW: number;
  originalH: number;
}

export interface PlacedBin {
  stockId: string;
  w: number;
  h: number;
  placed: PlacedPart[];
  utilization: number;
}

export interface OptResult {
  bins: PlacedBin[];
  unplaced: { part: PartInput, reason: string }[];
  stats: {
    totalArea: number;
    usedArea: number;
    wastePercent: number;
    totalBins: number;
  };
}

class GuillotineBin {
  w: number;
  h: number;
  freeRects: Rect[];
  placed: any[];

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.freeRects = [{ x: 0, y: 0, w, h }];
    this.placed = [];
  }

  insert(itemW: number, itemH: number, partId: string, name: string, rotatable: boolean): boolean {
    let bestNodeIndex = -1;
    let bestScore = Infinity;
    let bestShortSideFit = Infinity;
    let isRotated = false;

    const evalFit = (reqW: number, reqH: number, rotatedState: boolean, index: number, fr: Rect) => {
      // Guillotine cuts require the entire reqW and reqH to fit
      if (reqW <= fr.w && reqH <= fr.h) {
          let score = fr.w * fr.h - reqW * reqH;
          let shortSideFit = Math.min(fr.w - reqW, fr.h - reqH);
          
          if (score < bestScore || (score === bestScore && shortSideFit < bestShortSideFit)) {
            bestScore = score;
            bestShortSideFit = shortSideFit;
            bestNodeIndex = index;
            isRotated = rotatedState;
          }
      }
    };

    for (let i = 0; i < this.freeRects.length; i++) {
        let fr = this.freeRects[i];
        evalFit(itemW, itemH, false, i, fr);
        if (rotatable && itemW !== itemH) {
           evalFit(itemH, itemW, true, i, fr); // Try rotated
        }
    }

    if (bestNodeIndex === -1) return false;

    let fr = this.freeRects[bestNodeIndex];
    let finalW = isRotated ? itemH : itemW;
    let finalH = isRotated ? itemW : itemH;
    
    this.placed.push({ x: fr.x, y: fr.y, w: finalW, h: finalH, partId, name, rotated: isRotated });
    this.split(bestNodeIndex, finalW, finalH);
    return true;
  }

  split(nodeIndex: number, pw: number, ph: number) {
    let fr = this.freeRects[nodeIndex];
    this.freeRects.splice(nodeIndex, 1); // remove the consumed free rect

    let w = fr.w;
    let h = fr.h;

    // MINAS (Minimize the aspect ratio or Maximize the area of the larger remaining free rect)
    let horizSplitLargerArea = Math.max((w - pw) * ph, w * (h - ph));
    let vertSplitLargerArea = Math.max((w - pw) * h, pw * (h - ph));

    // We choose the split that creates the largest possible continuous free space
    if (horizSplitLargerArea > vertSplitLargerArea) {
      if (w - pw > 0) this.freeRects.push({ x: fr.x + pw, y: fr.y, w: w - pw, h: ph });
      if (h - ph > 0) this.freeRects.push({ x: fr.x, y: fr.y + ph, w: w, h: h - ph });
    } else {
      if (w - pw > 0) this.freeRects.push({ x: fr.x + pw, y: fr.y, w: w - pw, h: h });
      if (h - ph > 0) this.freeRects.push({ x: fr.x, y: fr.y + ph, w: pw, h: h - ph });
    }
  }
}

export function optimizeCutlist(stocks: StockInput[], parts: PartInput[], kerf: number): OptResult {
  // Expand requested parts into individual placement attempts
  let items: { id: string, name: string, w: number, h: number, rotatable: boolean, area: number }[] = [];
  for (let p of parts) {
    if (p.w <= 0 || p.h <= 0 || p.count <= 0) continue;
    for (let i = 0; i < p.count; i++) {
        items.push({ id: p.id, name: p.name, w: p.w, h: p.h, rotatable: p.rotatable, area: p.w * p.h });
    }
  }

  // Sort parts by maximum side descending (standard heuristic for maxrect/guillotine bins)
  items.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h) || b.area - a.area);

  let availableBins: {id: string, w: number, h: number}[] = [];
  for (let s of stocks) {
    if (s.w <= 0 || s.h <= 0 || s.count <= 0) continue;
    for (let i = 0; i < s.count; i++) {
      availableBins.push({ id: s.id, w: s.w, h: s.h });
    }
  }

  let unplaced: {part: PartInput, reason: string}[] = [];
  
  // Trick: To account for kerf in a zero-kerf algorithm, we inflate the stock and parts by the kerf amount.
  let guillotines = availableBins.map(b => ({
    stockId: b.id,
    originalW: b.w,
    originalH: b.h,
    packer: new GuillotineBin(b.w + kerf, b.h + kerf)
  }));

  for (let item of items) {
    let placed = false;
    let reqW = item.w + kerf;
    let reqH = item.h + kerf;

    for (let i = 0; i < guillotines.length; i++) {
        let g = guillotines[i].packer;
        let fit = g.insert(reqW, reqH, item.id, item.name, item.rotatable);
        if (fit) {
            placed = true;
            let p = g.placed[g.placed.length - 1];
            p.originalW = p.rotated ? item.h : item.w;
            p.originalH = p.rotated ? item.w : item.h;
            break;
        }
    }

    if (!placed) {
        let origPart = parts.find(p => p.id === item.id);
        if (origPart && !unplaced.find(u => u.part.id === origPart!.id)) {
            unplaced.push({ part: origPart, reason: "Plakalara sığmadı" });
        }
    }
  }

  let totalArea = 0;
  let usedArea = 0;
  let activeBins = 0;
  let resultBins: PlacedBin[] = [];

  for (let g of guillotines) {
    if (g.packer.placed.length > 0) {
      activeBins++;
      let binArea = g.originalW * g.originalH;
      totalArea += binArea;
      
      let binUsedArea = 0;
      let finalPlaced: PlacedPart[] = g.packer.placed.map((p: any) => {
        binUsedArea += p.originalW * p.originalH;
        return {
           x: p.x,
           y: p.y,
           w: p.originalW, // The true visual width without kerf
           h: p.originalH, // The true visual height without kerf
           partId: p.partId,
           name: p.name,
           rotated: p.rotated,
           originalW: p.originalW,
           originalH: p.originalH
        };
      });

      usedArea += binUsedArea;

      resultBins.push({
        stockId: g.stockId,
        w: g.originalW,
        h: g.originalH,
        placed: finalPlaced,
        utilization: (binUsedArea / binArea) * 100
      });
    }
  }

  return {
    bins: resultBins,
    unplaced,
    stats: {
      totalArea,
      usedArea,
      wastePercent: totalArea > 0 ? ((totalArea - usedArea) / totalArea) * 100 : 0,
      totalBins: activeBins
    }
  };
}
