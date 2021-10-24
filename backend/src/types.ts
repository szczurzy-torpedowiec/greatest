export interface PrintTokenBody {
  doubleSided: boolean;
  testShortId: string;
  sheetShortIds: string[];
}

export interface StudentTokenBody {
  sheetId: string;
}
