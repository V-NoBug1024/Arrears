import * as React from "react";
import * as qs from "query-string";
import * as styles from './index.scss';
import Card from "./components/Card"
import * as api from "../../services/arrearsWarning";
import ProductList from "../TemporaryGoods/components/ProductList";
import {Badge, Tabs} from "antd-mobile";

const { useState, useEffect } = React;
export default React.memo(() => {
	const [msgid, setMsgid] = useState(null);
	const [isLoading, setIsloading] = useState(false);
	const [data, setData] = useState(null);
	const [chooseData, setChooseData] = useState(null);
	const [nowDate, setNowDate] = useState(null);
	const [editIndex, setEditIndex] = useState(null);
	const [tabIndex, setTabIndex] = useState(0)
	const [showMask, setShowMask] = useState(false)
	const [categoryList, setCategoryList] = useState([])
	const [businCodeList, setBusinCodeList] = useState([])
	const [confirmBusinCodeList, setConfirmBusinCodeList] = useState([])

	useEffect(() => {
		const params = qs.parse(window.location.search);
		const { msgid } = params;
		// const msgid = '545c84bb-416a-4a9f-8d25-37b4936c9b6d';
		setMsgid(msgid)
		fetchData(msgid)
		fetchChooseData(msgid)
	}, [])

	useEffect(() => {
		if(!data){
			return
		}
		categoryDateFormate(data)
	}, [data])

	const fetchData = (msgid) => {
		// setLoading(true);
		api.getSuppDebt({ msgid }, true).then((res: any) => {
			if (res) {
				const { title, suppApList = [], dateNow } = res;
				document.title = title;
				setNowDate(dateNow)
				setData([...dataFormat(suppApList)])
			}
		});
	};

	const fetchChooseData = (msgid) => {
		api.getSuppApResultOptions({ msgid }, true).then((res: any) => {
			if (res) {
				setChooseData(res)
			}
		});
	};

	const submit = (param) => {
		const tempParam = {
			msgid
		}
		const { postParam, index } = param
		const submitParam = Object.assign(postParam, tempParam)
		api.submitResult(submitParam, true).then((res: any) => {
			let i = null;
			data.forEach((item, ind) => {
				if(item.msgseq == index){
					i = ind
				}
			})
			data[i].dealResult = postParam.dealResult
			data[i].dealTime = postParam.dealTime
			setEditIndex(null)
			setData([...dataFormat(data)])
		}).catch(err => {
			// alert('提交失败，请重新操作')
		});
	};

	const dataFormat = (data) => {
		const data1 = [];
		const data2 = [];
		debugger
		data.forEach((item) => {
			if(item.dateSkey%100 == 28){
				return
			}
			if(item.dealResult){
				data1.push(item)
			}else{
				data2.push(item)
			}
		})

		return [...data2, ...data1]
	}

	const tabs = [
		{ title: <Badge>全部</Badge> },
		{ title: <Badge>自营</Badge> },
		{ title: <Badge>联营</Badge> },
		{ title: <Badge>租赁</Badge> },
	];

	const categoryDateFormate = (suppApList) => {
		const categoryList = [0,1,2,3].map((item) => {
			if(item == 0){
				return categoryDateHandle(suppApList)
			}else{
				return categoryDateHandle(suppApList.filter((item2) => item2.dataType == item))
			}
		})

		// console.log('categoryList======', categoryList)
		setCategoryList(categoryList)
	}

	const categoryDateHandle = (suppApList) => {

		let categoryDate = []
		suppApList.map((item) => {

			let businCode = item.businCode;
			let itemCategSnam = item.itemCategSnam;
			let dealResultNum = 0;
			let dealResultAll = 1;
			if(item.dealResult){
				dealResultNum = dealResultNum + 1;
			}
			let businessIndex = -1;
			let businIndex = -1;

			categoryDate.filter((item2, index2) => {
				if(item.businessInclass == item2.businessInclass){
					businessIndex = index2
				}
			})

			if(businessIndex > -1){
				categoryDate[businessIndex].businessDealResultAll = categoryDate[businessIndex].businessDealResultAll+1
				if(item.dealResult){
					categoryDate[businessIndex].businessDealResultNum = categoryDate[businessIndex].businessDealResultNum+1
				}

				categoryDate[businessIndex].list.filter((item3, index3) => {
					if(item.businCode == item3.businCode){
						businIndex = index3
					}
				})

				if(businIndex > -1){
					let data = categoryDate[businessIndex].list[businIndex];
					categoryDate[businessIndex].list[businIndex].dealResultAll = data.dealResultAll+1
					if(item.dealResult){
						categoryDate[businessIndex].list[businIndex].dealResultNum = data.dealResultNum+1
					}
				}else{
					categoryDate[businessIndex].list.push({businCode,itemCategSnam, dealResultNum, dealResultAll})
				}

			}else{
				let businessDealResultAll = 1;
				let businessDealResultNum = 0;
				if(item.dealResult){
					businessDealResultNum = businessDealResultNum + 1;
				}
				categoryDate.push({businessInclass: item.businessInclass,businessInclassName: item.businessInclassName, businessDealResultAll,businessDealResultNum,list:[{businCode,itemCategSnam, dealResultNum, dealResultAll}]})
			}
		})
		return categoryDate
		console.log('categoryDate========', categoryDate)
	}

	const categoryHandle = (code) => {
		let index = businCodeList.indexOf(code);
		if(index == -1){
			setBusinCodeList([...businCodeList,code])
		}else{
			let codeList = [...businCodeList]
			codeList.splice(index, 1)
			setBusinCodeList([...codeList])
		}
	}
	const tabClick = (tab,index) => {
		setShowMask(true)
		if(index == tabIndex){
			return
		}
		setTabIndex(index)
		setBusinCodeList([])
		setConfirmBusinCodeList([])
	}

	const confirmHandle = () => {
		setShowMask(false)
		setConfirmBusinCodeList([...businCodeList])
	}

	const cancelHandle = () => {
		setBusinCodeList([...confirmBusinCodeList])
		setShowMask(false)
	}
	const resetHandle = () => {
		setBusinCodeList([])
		// setConfirmBusinCodeList([])
		// setShowMask(false)
	}
	return (
		<>
		<div className={styles.tab_wrap}>
			<Tabs tabs={tabs} initialPage={0} useOnPan={false} swipeable={false} tabBarUnderlineStyle={{borderColor: '#fff',}} tabBarActiveTextColor='#f1473c' tabBarInactiveTextColor='#01264a' animated={false}  onTabClick={tabClick}>
				{showMask && categoryList.map((part, index) => {
					return(
						<div className={styles.part_wrap} key={`categoryList_${index}`}>
							{part.map(item => {
								return (
										<div className={styles.part} key={`categoryList_${index}_${item.businessInclass}`}>
											<div className={styles.part_tit}>{item.businessInclassName}（{item.businessDealResultAll - item.businessDealResultNum}/{item.businessDealResultAll}）</div>
											<div className={styles.part_item_wrap}>
												{
													item.list.map(item2 => {
														return(
															<div key={`categoryList_${index}_${item.businessInclass}_${item2.businCode}`} className={`${styles.part_item} ${item2.itemCategSnam.length > 5 ?  styles.size_long : ''} ${businCodeList.includes(item2.businCode) ? styles.item_active : ''}`}  onClick={() => categoryHandle(item2.businCode)}>{item2.itemCategSnam}(<span style={{'color': `${item2.dealResultAll - item2.dealResultNum == 0 ? '#323232' : 'fe473c'}`}}>{item2.dealResultAll - item2.dealResultNum}</span>/{item2.dealResultAll})</div>
														)
													})
												}
											</div>
										</div>
									)
							})}
							{part.length == 0 && <div style={{height:'50px',lineHeight: '50px',textAlign: "center"}}>暂无数据</div>}
						</div>
					)
				})}
			</Tabs>
			{showMask && <div className={styles.button_wrap}>
				<div onClick={cancelHandle} style={{backgroundColor: '#eee'}}>取消</div>
				<div onClick={resetHandle}>重置</div>
				<div style={{color: '#fff',backgroundColor: '#fe473c'}} onClick={confirmHandle}>确定</div>
			</div>}
		</div>
			{showMask && <div className={styles.mask}></div>}
		<div className={styles.listwrap}>
			{ data && data.length > 0 && data.filter((item) => {
				if(confirmBusinCodeList.length){
					if(tabIndex == 0){
						return confirmBusinCodeList.includes(item.businCode)
					}else{
						return confirmBusinCodeList.includes(item.businCode)  && item.dataType == tabIndex
					}
				}else if(tabIndex == 0){
					return true
				}else {
					return item.dataType == tabIndex
				}
			}).map((v, index) => {
				const active = index === editIndex && true 
			  return <Card active={active} defaultDate={nowDate} data={v} key={v.msgseq} chooseData={chooseData} bindClick={() => {setEditIndex(index)}} bindSubmit={(postParam) => {submit({postParam, index: v.msgseq})}}></Card>
			})
			}
		</div>
		</>
	);
});

