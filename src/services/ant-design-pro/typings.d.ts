// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    name?: string;
    avatar?: string;
    userid?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
  };

  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };


  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type CameraListItem = {
    id?:number;
    indexCode?: string;
    name?: boolean;
    cameraTypeName?: string;
    signalId?: number;
    signalName?: string;
    hkMeta?: object;
    regionIndexCode?: string;
    regionName?: string;
    regionPathName?: string;
    regionPath?: string;
    updatedAt?: string;
    createdAt?: string;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type SingalListItem = {
    id?:number;
    name?: string;
    cameraCnt?: number;
    createdAt?: string;
  }

  type RegionListItem = {
    indexCode?: string;
    name?: string;
    pathName?: string;
    path?: string
  }


  type CameraList = ApiResponse<PaginationData<CameraListItem>>;

  type SignalList = ApiResponse<SingalListItem[]>;

  type RegionList = ApiResponse<>;
  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type ApiResponse<T=any> = {
    code?: number;
    msg?: string;
    data: T | PaginationData<T>;
  }

  type PaginationData<T> = {
    page?: number;
    pageSize?: number;
    total?: number;
    items?: T[];
  }

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };


  type SysConfig = {
    key?:string;
    value?:string;
  };

  type CONF_CAPTURE_PARALLELISM = 'capture:parallelism';
  type CONF_CAPTURE_INTERVAL_SECONDS = 'capture:interval_seconds';
}



