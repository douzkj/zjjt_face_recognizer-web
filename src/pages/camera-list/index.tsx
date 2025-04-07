import { addRule, removeRule, rule, updateRule, cameras, loadSignals, bindSignal, saveSignal, loadRegions } from '@/services/ant-design-pro/api';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, Input, message, Tree, Modal, Row, Col, Card, Select } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import {match} from 'pinyin-pro';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addRule({ ...fields });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error) {
    hide();
    message.error('Adding failed, please try again!');
    return false;
  }
};

/**
 * @en-US 绑定通路
 * @param fields
 */
const signalBind = async (fields: API.CameraListItem) => {
  const hide = message.loading('正在添加');
  try {
    await addRule({ ...fields });
    hide();
    message.success('Added successfully');
    return true;
  } catch (error) {
    hide();
    message.error('Adding failed, please try again!');
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('Configuring');
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();

    message.success('Configuration is successful');
    return true;
  } catch (error) {
    hide();
    message.error('Configuration failed, please try again!');
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.RuleListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success('Deleted successfully and will refresh soon');
    return true;
  } catch (error) {
    hide();
    message.error('Delete failed, please try again');
    return false;
  }
};

const batchBindSignal = async (selectedRows: API.CameraListItem[], signalId:number) => {
  const hide = message.loading('正在绑定');
  if (!selectedRows) return true;
  try {
    await bindSignal(selectedRows.map((row) => row.id), signalId);
    hide();
    message.success('绑定通路成功');
    return true;
  } catch (error) {
    hide();
    message.error('绑定通路失败');
    return false;
  }
}

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);

  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [singalOptions, setSignalOptions] = useState<API.SignalList[]>([]);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.CameraList>();
  const [selectedRowsState, setSelectedRows] = useState<API.CameraListItem[]>([]);

  /**
   * 左侧通路列表
   */
  const [leftSignalList, setLeftSignalList] = useState<API.SignalList[]>([]);
  const [isSignalModalVisible, setIsSignalModalVisible] = useState(false);
  const [signalEditingNode, setSignalEditingNode] = useState<any>(null);
  const [regionOptions, setRegionOptions] = useState<any[]>([]);
  const [regionSelectmaxWidth, setRegionSelectmaxWidth] = useState<number>(400);

  useEffect(() => {
    const load = async () => {
      const data = await loadRegions();
      if (data) {
        const options = data
          .sort((a, b) => a.pathName.localeCompare(b.pathName))
          .map(item => ({ label: item.pathName, value: item.indexCode }));
          
        // 计算最大字符长度
        const maxLength = Math.max(...options.map(opt => opt.label.length), 0);
        // 根据视窗宽度和字符长度动态计算
      // const viewportWidth = window.innerWidth;
      // const calculatedWidth = Math.min(
      //   Math.max(maxLength * 16 + 20, 200), 
      //   viewportWidth * 0.8 // 最大不超过视窗宽度的80%
      // );
        // 根据字符长度设置宽度（每个中文字约16px，英文字约8px）
        const calculatedWidth = Math.min(Math.max(maxLength * 16 + 20, 200), 800); // 限制最小200px最大800px
      
        
        setRegionOptions(options);
        setRegionSelectmaxWidth(calculatedWidth);
      }
    };
    load();
  }, []);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.CameraList>[] = [
    {
      title: '设备名称',
      dataIndex: 'name',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              console.log('entity', entity)
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '设备编码',
      dataIndex: 'indexCode',
    },
    {
      title: '通路名称',
      dataIndex: 'signalId',
      valueType: 'select',
      request: async () => {
        return await loadSignals();
      },
      search: {
        transform: v => ({ signalId: v })
      }

    },
    {
      title: '所在区域',
      dataIndex: 'regionIndexCode',
      valueType: 'select',
      // request: async () => {
      //   const data = await loadRegions();
      //   console.log(data)
      //   if (data != null) {
      //     const optoins =  data
      //     .sort((a, b) => a.pathName.localeCompare(b.pathName)) // 添加字典排序
      //     .map(item => {
      //       return {
      //         label: item.pathName,
      //         value: item.indexCode,
      //       }
      //     });
      //     setRegionOptions(optoins);
      //     return optoins;
      //   }
      //   return [];
      // },
      search: {
        // formItemProps: {
        //   style: { 
        //     width: regionSelectmaxWidth,
        //     maxWidth: '70vw' // 添加最大视窗宽度限制
        //   } // 自定义宽度
        // }
        // transform: v => ({ regionIndexCode: v }),
      },
      fieldProps: {
        showSearch: true,
        options: regionOptions, // 使用缓存数据
        optionFilterProp: 'label',
        filterOption: (input, option) => 
          match(option.label, input) || 
          option.value.toString().includes(input)
      },
      render: (dom, entity) => {
        return entity.regionPathName;
      },
      

    },

    {
      title: '设备状态',
      dataIndex: 'status',
      hideInForm: true,
      search: false,
      valueEnum: {
        0: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.default"
              defaultMessage="Shut down"
            />
          ),
          status: 'Default',
        },
        1: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.running" defaultMessage="Running" />
          ),
          status: 'Processing',
        },
        2: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.online" defaultMessage="Online" />
          ),
          status: 'Success',
        },
        3: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.abnormal"
              defaultMessage="Abnormal"
            />
          ),
          status: 'Error',
        },
      },
    },
    {
      title: '设备最新更新时间',
      sorter: true,
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      search: false,
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        const status = form.getFieldValue('status');
        if (`${status}` === '0') {
          return false;
        }
        if (`${status}` === '3') {
          return (
            <Input
              {...rest}
              placeholder={intl.formatMessage({
                id: 'pages.searchTable.exception',
                defaultMessage: 'Please enter the reason for the exception!',
              })}
            />
          );
        }
        return defaultRender(item);
      },
    }
  ];

  return (
    <PageContainer>
      <ProTable<API.CameraList, API.PageParams>
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> 分配通路
          </Button>
        ]}
        request={cameras}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />

      {/* 通路编辑弹窗 */}
      <ModalForm
        title={signalEditingNode ? "编辑通路" : "新建通路"}
        open={isSignalModalVisible}
        width="400px"
        onOpenChange={setIsSignalModalVisible}
        // onCancel={() => setIsModalVisible(false)}
        onFinish={async (values) => {
          // 这里调用API保存通路数据
          const res = await saveSignal(values);
          if (res.success) {
            // 成功后更新左侧通路树
            message.success('保存成功');
          }
          console.log('提交通路数据:', values);
          setIsSignalModalVisible(false);
        }}
      >
          <ProFormText
            name="name"
            label="通路名称"
            initialValue={signalEditingNode?.name}
            rules={[{ required: true }]}
          />
          
      </ModalForm>
      

      <ModalForm
        title= '分配通路'
        width="400px"
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          console.log('select siganl', value);
          if (selectedRowsState.length === 0) {
            message.error('请选择设备');
            return;
          }
          const success =  await batchBindSignal(selectedRowsState, value.signalId);
          if (success) {
            handleModalOpen(false);
            setSelectedRows([]);
            actionRef.current?.reloadAndRest?.();
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormSelect
              request={loadSignals}
              params={{}}
              width="md"
              name="signalId"
              />
      </ModalForm>
      <UpdateForm
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        updateModalOpen={updateModalOpen}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.CameraListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.CameraListItem>[]}
          >
          </ProDescriptions>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
