import * as React from "react";
import * as styles from './index.scss';
import { Modal, PickerView, DatePickerView } from "antd-mobile";

interface IProps {
  data: any,
  defaultDate?: any,
  chooseData?: any,
  key?: any,
  bindClick?: any,
  bindSubmit?: any,
  active?: any,
}

const { useState, useEffect } = React
export default React.memo((props: IProps) => {
  const [toggleMore, setToggleMore] = useState(null);
  const [showChoose, setShowChoose] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [optionsData, setOptionsData] = useState([]);
  const [dealResult, setDealResult] = useState(null);
  const [changeValueDate, setChangeValueDate] = useState(null);
  const [defaultValueDate, setDefaultValueDate] = useState(null);
  const [dealTime, setDealTime] = useState(null);
  
  const { data, chooseData, bindClick, defaultDate, active = false, bindSubmit } = props;
  useEffect(() => {
    const suppApDetailList  = data.suppApDetailList;
    if (data) {
      (suppApDetailList && suppApDetailList.length >= 4) && setToggleMore(false);
      const now = new Date(parseInt(defaultDate, 10));
      setDefaultValueDate(now)
    }
  }, [data]);

  const toggleChoose = () => {
    setShowChoose(!showChoose)
    bindClick()
    setOptionsData(chooseData)
  }

  const toggleDate = () => {
    setShowDate(true)
    bindClick()
  }

  const onOptionChange = (data) => {
    setDealResult(data)

  }
  // 获取欠款措施
  const getResult = () => {
    if (!dealResult) {
      setDealResult([optionsData[0].value])
    }
    setShowChoose(false)
  }

  // 获取日期
  const getDate = () => {
    if (!this.tempDate) {
      setChangeValueDate(defaultValueDate)
      const tempDate = [defaultValueDate.getFullYear(), defaultValueDate.getMonth() + 1, defaultValueDate.getDate()]
      this.tempDate = tempDate.join('.')
    }
    setDealTime(this.tempDate)
    setShowDate(false)
  }
  
  // 日期变化event
  const onValueChangeDate = (data) => {
    data[1] = Number(data[1]) + 1
    this.tempDate = data.join('.')
  }

  const onChangeDate = (data) => {
    setChangeValueDate(data)
  }

  const submit = (e) => {
    const param = {
      msgseq: data.msgseq,
      dealResult: dealResult ? dealResult[0] : null,
      dealTime,
    };
    
    if (!param.dealTime || !param.dealResult || !param.msgseq) {
      return;
    }
    bindSubmit(param)
  }

  const getCancel = () => {
    setShowChoose(false)
    setShowDate(false)
  }

  return (
    <>
      {/* <TipsDialog
      cancelBtn={false}
      visible={showChoose}
      okText="关闭"
      title='统计口径说明'>
      <div className={styles.tips}>
        <div>1、在线销售实收: 当日已完成支付与已完成退款的订单实收之和。</div>
        <div>2、全渠道销售实收: 当日百货线下渠道实收与百货到家实收之和。</div>
        <div>3、在线销售占比=在线销售实收/全渠道销售实收。</div>
        <div>4、百货到家客单量: 每笔正向订单视为1笔客单，逆向订单仅在全部退货情况下视为-1客单。</div>
        <div>5、百货到家客单价=在线销售实收/百货到家客单量。</div>
      </div>
    </TipsDialog> */}

      <Modal
        popup
        maskClosable={true}
        visible={showChoose}
        className={styles.modal}
        animationType="slide-up"
      >
        <div className={styles.modalHeader}>
          <div onClick={getCancel} className={styles.cancelText}>
            取消
          </div>
          <div onClick={getResult} className={styles.okText}>
            确定
          </div>
        </div>
        <PickerView
          value={dealResult}
          data={optionsData}
          onChange={onOptionChange}
          cascade={false}
        />
      </Modal>

      <Modal
        popup
        maskClosable={showDate}
        visible={showDate}
        animationType="slide-up"
        wrapClassName={styles.dateWrapModal}
        className={styles.modal}
      >
        <div className={styles.modalHeader}>
          <div onClick={getCancel} className={styles.cancelText}>
            取消
          </div>
          <div onClick={getDate} className={styles.okText}>
            确定
          </div>
        </div>
        <DatePickerView
          mode="date"
          minDate={defaultValueDate}
          value={changeValueDate ? changeValueDate : defaultValueDate}
          onChange={onChangeDate}
          onValueChange={onValueChangeDate}
        />
      </Modal>

      <div
        className={
          active
            ? `${styles.cardWrap} ${styles.cardActive}`
            : `${styles.cardWrap}`
        }
      >
        <div className={styles.header}>
          <div className={styles.tl}>
            <div className={styles.title}>{data.suppName || "--"}</div>
            <div className={styles.subTitle}>
              {data.suppTitle}：{data.suppId || "--"}
            </div>
          </div>
          {data.dealResult ? (
            <img
              style={{ width: "60px", height: "60px" }}
              src={require("../../images/icon_mask.png")}
            />
          ) : (
            <div
              onClick={(e) => {
                submit(e);
              }}
              className={
                dealTime && dealResult
                  ? `${styles.submitBtn} ${styles.btn}`
                  : `${styles.disableBtn} ${styles.btn}`
              }
            >
              提交
            </div>
          )}
        </div>
        {/*content*/}
        <div className={styles.content}>
          {/*处理详情*/}
          <div className={styles.item}>
            <div className={styles.col}>
              <div className={styles.title}>跟进措施</div>
              {data.dealResult || dealResult ? (
                <div
                  onClick={dealResult && toggleChoose}
                  className={`${styles.pt6} ${styles.active}`}
                >
                  {data.dealResult ? data.dealResult : dealResult[0]}
                </div>
              ) : (
                <div className={styles.text} onClick={toggleChoose}>
                  点击选择跟进措施
                </div>
              )}
            </div>
            <div className={styles.col}>
              <div className={styles.title}>预计处理时间</div>
              {(data.dealResult && data.dealTime) || dealTime ? (
                <div
                  onClick={
                    dealTime &&
                    (() => {
                      setShowDate(true);
                    })
                  }
                  className={`${styles.pt6} ${styles.active}`}
                >
                  {data.dealTime ? data.dealTime : dealTime}
                </div>
              ) : (
                <div className={styles.text} onClick={toggleDate}>
                  点击选择预计处理时间
                </div>
              )}
            </div>
          </div>
          {/*欠款金额*/}
          <div className={styles.item}>
            <div className={styles.col} style={{ flex: 2 }}>
              <div>欠款金额</div>
              <div className={styles.text}>{data.totalSuppLoan || "--"}</div>
            </div>
            <div className={styles.col}>
              <div>预付款</div>
              <div className={styles.text}>{data.advance || "--"}</div>
            </div>
            <div className={styles.col}>
              <div>账期</div>
              <div className={styles.text}>{data.debtPeriod || "--"}</div>
            </div>
          </div>
          {/*明细*/}
          <div className={styles.detail}>
            <div className={styles.title}>
              <div className={styles.left}>欠款明细数据</div>
              {data.suppApDetailList && data.suppApDetailList.length >= 4 && (
                <div
                  onClick={() => setToggleMore(!toggleMore)}
                  className={styles.right}
                >
                  {toggleMore ? "收起" : "展开"}
                </div>
              )}
            </div>
            <div className={styles.detailItem}>
              <div className={styles.col}>
                <div className={styles.label}>会计期间</div>
              </div>
              <div className={styles.col}>
                <div className={styles.label}>欠款金额</div>
              </div>
              <div className={styles.col}>
                <div className={styles.label}>品类名称</div>
              </div>
            </div>
            {data.suppApDetailList &&
              data.suppApDetailList.length > 0 &&
              data.suppApDetailList.map((v, index) => {
                return (
                  <div
                    className={
                      !toggleMore && index + 1 >= 4
                        ? `${styles.disableItem}`
                        : `${styles.detailItem}`
                    }
                    key={index}
                  >
                    <div className={styles.col}>
                      <div className={styles.text}>{v.acctPeriod || "--"}</div>
                    </div>
                    <div className={styles.col}>
                      <div className={styles.text}>{v.suppLoan || "--"}</div>
                    </div>
                    <div className={styles.col}>
                      <div className={styles.text}>
                        {v.businessInclassName || "--"}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
})