// 干燥剂周期
export interface DryAgent {
  period: number;
  time: { minutes: number; seconds: number };
}

// 喂食计划
export interface MealPlan {
  repeatStr: string;
  timeStr: string;
  switchValue: boolean;
  parts: number;
}

// 喂食结果
export interface EatResult {
  planParts: number;
  parts: number;
  fault: number;
}

// picker
export interface IPickerValue {
  value: number | string;
  label: string;
}
