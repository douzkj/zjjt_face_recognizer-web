interface Visitor {
    id: string;
    user_id: string;
    visit_cnt: number;
    show_status: 0 | 1;
    face_img_path: string;
  }
  
  interface VisitorTaskShowInfo {
    visitors: Visitor[];
  }

  interface VisitorTaskShowResponse {
    data: string; // 原始字符串数据
  }