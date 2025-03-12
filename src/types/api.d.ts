// src/types/api.d.ts
declare namespace API {
    // 当前任务接口响应
    interface CurrentTaskResponse {
      task_id: string | null;
    }
  
    // 访客展示信息请求参数
    interface VisitorTaskShowParams {
      task_id?: string;
    }
  }