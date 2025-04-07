import { Request, Response } from 'express';
import moment from 'moment';
import { parse } from 'url';


// mock cameraListDataSource
const genCameraList = (current: number, pageSize: number) => {
  const cameraListDataSource: API.CameraListItem[] = [];

  for (let i = 0; i < pageSize; i += 1) {
    const index = (current - 1) * 10 + i;
    cameraListDataSource.push({
      id: index,
      indexCode: `IndexCode ${index}`,
      name: `CameraName ${index}`,
      cameraTypeName: 'TypeA',
      signalId: Math.floor(Math.random() * 100),
      signalName: `Signal ${Math.floor(Math.random() * 100)}`,
      hkMeta: {},
      updatedAt: moment().format('YYYY-MM-DD'),
      createdAt: moment().format('YYYY-MM-DD'),
    });
  }
  cameraListDataSource.reverse();
  return cameraListDataSource;
};

let cameraListDataSource = genCameraList(1, 100);

function getCameraList(req: Request, res: Response, u: string) {
  let realUrl = u;
  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }
  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query as unknown as API.PageParams &
    API.CameraListItem & {
      sorter: any;
      filter: any;
    };

  let dataSource = [...cameraListDataSource].slice(
    ((current as number) - 1) * (pageSize as number),
    (current as number) * (pageSize as number),
  );

  if (params.sorter) {
    const sorter = JSON.parse(params.sorter);
    dataSource = dataSource.sort((prev, next) => {
      let sortNumber = 0;
      (Object.keys(sorter) as Array<keyof API.CameraListItem>).forEach((key) => {
        let nextSort = next?.[key] as number;
        let preSort = prev?.[key] as number;
        if (sorter[key] === 'descend') {
          if (preSort - nextSort > 0) {
            sortNumber += -1;
          } else {
            sortNumber += 1;
          }
          return;
        }
        if (preSort - nextSort > 0) {
          sortNumber += 1;
        } else {
          sortNumber += -1;
        }
      });
      return sortNumber;
    });
  }

  if (params.filter) {
    const filter = JSON.parse(params.filter as any) as {
      [key: string]: string[];
    };
    if (Object.keys(filter).length > 0) {
      dataSource = dataSource.filter((item) => {
        return (Object.keys(filter) as Array<keyof API.CameraListItem>).some((key) => {
          if (!filter[key]) {
            return true;
          }
          if (filter[key].includes(`${item[key]}`)) {
            return true;
          }
          return false;
        });
      });
    }
  }

  if (params.name) {
    dataSource = dataSource.filter((data) => data?.name?.includes(params.name || ''));
  }

  const result = {
    data: dataSource,
    total: cameraListDataSource.length,
    success: true,
    pageSize,
    current: parseInt(`${params.current}`, 10) || 1,
  };

  return res.json(result);
}

function postCameraList(req: Request, res: Response, u: string, b: Request) {
  let realUrl = u;
  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }

  const body = (b && b.body) || req.body;
  const { method, name, indexCode, id } = body;

  switch (method) {
    case 'delete':
      cameraListDataSource = cameraListDataSource.filter((item) => id.indexOf(item.id) === -1);
      break;
    case 'post':
      (() => {
        const newCamera: API.CameraListItem = {
          id: cameraListDataSource.length,
          indexCode: indexCode || `IndexCode ${cameraListDataSource.length}`,
          name: name || `CameraName ${cameraListDataSource.length}`,
          cameraTypeName: 'TypeA',
          signalId: Math.floor(Math.random() * 100),
          signalName: `Signal ${Math.floor(Math.random() * 100)}`,
          hkMeta: {},
          updatedAt: moment().format('YYYY-MM-DD'),
          createdAt: moment().format('YYYY-MM-DD'),
        };
        cameraListDataSource.unshift(newCamera);
        return res.json(newCamera);
      })();
      return;

    case 'update':
      (() => {
        let newCamera = {};
        cameraListDataSource = cameraListDataSource.map((item) => {
          if (item.id === id) {
            newCamera = { ...item, indexCode, name };
            return { ...item, indexCode, name };
          }
          return item;
        });
        return res.json(newCamera);
      })();
      return;
    default:
      break;
  }

  const result = {
    list: cameraListDataSource,
    pagination: {
      total: cameraListDataSource.length,
    },
  };

  res.json(result);
}

export default {
  'GET /api/cameraList': getCameraList,
  'POST /api/cameraList': postCameraList,
};
