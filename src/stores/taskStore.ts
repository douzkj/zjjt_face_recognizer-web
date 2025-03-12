import { create } from 'zustand';

interface TaskState {
  taskId: string | null;
  recongCnt: number;
  setTaskId: (id: string | null) => void;
  setRecongCnt: (cnt: number) => void;
  clearTaskId: () => void;
}

export const useTaskStore = create<TaskState>(set => ({
  taskId: null,
  recongCnt: 0,
  setTaskId: (id) => set({ taskId: id }),
  setRecongCnt: (cnt) => set({ recongCnt: cnt }),
  clearTaskId: () => set({ taskId: null, recongCnt: 0 })
}));