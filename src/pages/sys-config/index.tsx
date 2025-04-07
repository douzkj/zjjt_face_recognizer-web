import {
  PageContainer,
  ProForm,
  ProFormDateRangePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Card, message } from 'antd';
import type { FC } from 'react';
import { saveSysConfig, loadSysConfig } from './service';
import useStyles from './style.style';
import React, { useRef, useState, useEffect } from 'react';



const BasicForm: FC<Record<string, any>> = () => {

  const { styles } = useStyles();
  const { run } = useRequest(saveSysConfig, {
    manual: true,
    onSuccess: () => {
      message.success('提交成功');
    },
  });
  const onFinish = async (values: Record<string, string>) => {
    run(values);
  };
  return (
    <PageContainer content="配置监控视频调度频率以及通路并发">
      <Card bordered={false}>
        <ProForm
          hideRequiredMark
          style={{
            margin: 'auto',
            marginTop: 8,
            maxWidth: 600,
          }}
          name="basic"
          layout="vertical"
          submitter= {{
            resetButtonProps: {
              style: {
                display: 'none'
              }
            },
            searchConfig: {
              submitText: '保存配置',
            }
          }}
          onFinish={onFinish}
          request={async () => {
            return await loadSysConfig().then((res) => {
              return res.data
            })
          }}
        >
          <ProFormDigit
            label={
              <span>
                通路并发度
                <em className={styles.optional}>(一次性读取多少通路的设备)</em>
              </span>
            }
            name="capture:parallelism"
            placeholder="请输入"
            min={1}
            max={100}
            defaultValue={10}
            width="xs"
            
          />
          <ProFormDigit
            label={
              <span>
                调度周期(单位：秒)
                <em className={styles.optional}>(控制系统多久调度一次)</em>
              </span>
            }
            name="capture:interval_seconds"
            placeholder="请输入"
            min={1}
            // max={100}
            defaultValue={10}
            width="xs"
           
          />

         
        </ProForm>
      </Card>
    </PageContainer>
  );
};
export default BasicForm;
