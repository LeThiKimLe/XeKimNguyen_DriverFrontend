import React from 'react'
import { Tab, TabPanel, Tabs, TabList } from 'react-tabs'
import { useEffect, useState } from 'react'
import staffThunk from 'src/feature/staff/staff.service'
import { useDispatch, useSelector } from 'react-redux'
import { selectDriverSchedules, selectDriverTrip } from 'src/feature/driver/driver.slice'
import driverThunk from 'src/feature/driver/driver.service'
import { selectUser } from 'src/feature/auth/auth.slice'
import { getTripJourney } from 'src/utils/tripUtils'
import {
    CSpinner,
    CRow,
    CFormLabel,
    CTable,
    CTableHeaderCell,
    CTableRow,
    CTableHead,
    CTableBody,
    CTableDataCell,
    CFormInput,
    CCol,
} from '@coreui/react'
import { selectListRoute } from 'src/feature/route/route.slice'
import { selectDriverRoute } from 'src/feature/driver/driver.slice'
import routeThunk from 'src/feature/route/route.service'
import { driverAction } from 'src/feature/driver/driver.slice'
import { convertToDisplayDate } from 'src/utils/convertUtils'
import { cilPencil } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import DetailBus from './DetailBus'
const TableSchedule = ({ listSchedule, time }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const listTrip = useSelector(selectDriverTrip)
    const [listGo, setListGo] = useState([])
    const [listReturn, setListReturn] = useState([])
    const [showDetailBus, setShowDetailBus] = useState(false)
    const getTurnGo = () => {
        const turnGo = listTrip.find((trip) => trip.turn === true)
        if (turnGo) return turnGo.schedules
        else return []
    }
    const getTurnReturn = () => {
        const turnReturn = listTrip.find((trip) => trip.turn === false)
        if (turnReturn) return turnReturn.schedules
        else return []
    }
    const getCurrentTrip = (schedule) => {
        const tripGo = listGo.find((schd) => schd.id === schedule.id)
        const tripReturn = listReturn.find((schd) => schd.id === schedule.id)
        if (tripGo)
            dispatch(driverAction.setCurrentTrip(listTrip.find((trip) => trip.turn === true)))
        if (tripReturn)
            dispatch(driverAction.setCurrentTrip(listTrip.find((trip) => trip.turn === false)))
        dispatch(driverAction.setCurrentSchedule(schedule))
        dispatch(driverAction.setCurrentTripTimeProps(time))
        navigate('detail')
    }
    const handleShowBusDetail = (bus) => {
        dispatch(driverAction.setCurrentBus(bus))
        setShowDetailBus(true)
    }
    useEffect(() => {
        setListGo(getTurnGo())
        setListReturn(getTurnReturn())
    }, [listTrip.length])
    return (
        <>
            {listSchedule.length === 0 ? (
                <div className="d-flex justify-content-center mt-3">
                    <h4>Chưa có chuyến xe</h4>
                </div>
            ) : (
                <CTable striped>
                    <CTableHead>
                        <CTableRow color="info">
                            <CTableHeaderCell scope="col">#</CTableHeaderCell>
                            <CTableHeaderCell className="text-center" scope="col">
                                Lượt xe
                            </CTableHeaderCell>
                            <CTableHeaderCell className="text-center" scope="col">
                                Ngày khởi hành
                            </CTableHeaderCell>
                            <CTableHeaderCell className="text-center" scope="col">
                                Khởi hành
                            </CTableHeaderCell>
                            <CTableHeaderCell className="text-center" scope="col">
                                Kết thúc
                            </CTableHeaderCell>
                            <CTableHeaderCell className="text-center" scope="col">
                                Xe bus
                            </CTableHeaderCell>
                            <CTableHeaderCell className="text-center" scope="col">
                                Chi tiết chuyến
                            </CTableHeaderCell>
                            <CTableHeaderCell className="text-center" scope="col">
                                Trạng thái xe
                            </CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {listSchedule.map((schedule, index) => (
                            <CTableRow key={index}>
                                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                <CTableDataCell className="text-center">
                                    {listGo.find((schd) => schd.id === schedule.id) && 'Lượt đi'}
                                    {listReturn.find((schd) => schd.id === schedule.id) &&
                                        'Lượt về'}
                                </CTableDataCell>
                                <CTableDataCell className="text-center">
                                    {convertToDisplayDate(schedule.departDate)}
                                </CTableDataCell>
                                <CTableDataCell className="text-center">
                                    {schedule.departTime.slice(0, -3)}
                                </CTableDataCell>
                                <CTableDataCell className="text-center">
                                    {schedule.finishTime !== '00:00:00'
                                        ? schedule.finishTime.slice(0, -3)
                                        : 'Đang cập nhật'}
                                </CTableDataCell>
                                <CTableDataCell className="text-center">
                                    {schedule.bus ? schedule.bus.licensePlate : 'Đang cập nhật'}
                                </CTableDataCell>
                                <CTableDataCell className="text-center">
                                    <i onClick={() => getCurrentTrip(schedule)} role="button">
                                        Chi tiết
                                    </i>
                                </CTableDataCell>
                                <CTableDataCell className="text-center">
                                    <i>
                                        {schedule.bus ? schedule.bus.availability : 'Đang cập nhật'}
                                    </i>
                                    {schedule.bus &&
                                        schedule.bus.availability !== 'Đang cập nhật' && (
                                            <CIcon
                                                color="success"
                                                icon={cilPencil}
                                                role="button"
                                                style={{ marginLeft: '5px' }}
                                                onClick={() => handleShowBusDetail(schedule.bus)}
                                            ></CIcon>
                                        )}
                                </CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            )}
            <DetailBus visible={showDetailBus} setVisible={setShowDetailBus}></DetailBus>
        </>
    )
}
const DriverTrip = () => {
    const route = useSelector(selectDriverRoute)
    const user = useSelector(selectUser)
    const listTrip = useSelector(selectDriverTrip)
    const listSchedule = useSelector(selectDriverSchedules)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [selectedTab, setSelectedTab] = useState(1)
    const getListSchedule = (time) => {
        var result = []
        const getTimeEndSpan = (schd) => {
            const startTime = new Date(schd.departDate + 'T' + schd.departTime)
            startTime.setHours(startTime.getHours() + route.hours)
            return startTime.getTime() - new Date().getTime()
        }
        const getTimeStartSpan = (schd) => {
            return (
                new Date(schd.departDate + 'T' + schd.departTime).getTime() - new Date().getTime()
            )
        }
        const getTime = (schd) => {
            return Math.abs(new Date(schd.departDate + 'T' + schd.departTime).getTime())
        }
        if (route) {
            if (time === 'past') result = listSchedule.filter((schd) => getTimeEndSpan(schd) <= 0)
            else if (time === 'current')
                result = listSchedule.filter(
                    (schd) => getTimeEndSpan(schd) >= 0 && getTimeStartSpan(schd) <= 60 * 60 * 1000,
                )
            else result = listSchedule.filter((schd) => getTimeStartSpan(schd) >= 60 * 60 * 1000)
        }
        return result.sort((a, b) => getTime(a) - getTime(b))
    }
    const getDriverRoute = (tripId, listRoute) => {
        for (let i = 0; i < listRoute.length; i++) {
            if (listRoute[i].trips && listRoute[i].trips.length !== 0)
                if (listRoute[i].trips.find((tp) => tp.id === tripId)) return listRoute[i]
        }
        return null
    }
    useEffect(() => {
        const getInfor = async () => {
            if (user) {
                setLoading(true)
                try {
                    await dispatch(driverThunk.getDriverTrip(user.user.driver.driverId)).unwrap()
                    await dispatch(
                        driverThunk.getDriverSchedules(user.user.driver.driverId),
                    ).unwrap()
                    setLoading(false)
                } catch (error) {
                    setLoading(false)
                }
            }
        }
        getInfor()
    }, [])
    useEffect(() => {
        if (!route && listTrip.length > 0) {
            dispatch(routeThunk.getRoute())
                .unwrap()
                .then((res) => {
                    dispatch(driverAction.setDriverRoute(getDriverRoute(listTrip[0].id, res)))
                })
                .catch((error) => {})
        }
    }, [listTrip])
    return (
        <>
            {listTrip.length !== 0 && (
                <CRow className="tabStyle">
                    <CRow>
                        <CFormLabel className="col-sm-2 col-form-label">Tuyến hoạt động</CFormLabel>
                        <CCol sm="5">
                            <CFormInput
                                className="col-sm-3"
                                disabled
                                defaultValue={getTripJourney(listTrip[0])}
                            ></CFormInput>
                        </CCol>
                    </CRow>
                    {listSchedule.length > 0 ? (
                        <Tabs
                            className="mt-3"
                            selectedIndex={selectedTab}
                            onSelect={(index) => setSelectedTab(index)}
                        >
                            <TabList>
                                <Tab>Đã thực hiện</Tab>
                                <Tab>Đang diễn ra</Tab>
                                <Tab>Sắp diễn ra</Tab>
                            </TabList>
                            <TabPanel>
                                <TableSchedule
                                    listSchedule={getListSchedule('past')}
                                    time="past"
                                ></TableSchedule>
                            </TabPanel>
                            <TabPanel>
                                <TableSchedule
                                    listSchedule={getListSchedule('current')}
                                    time="current"
                                ></TableSchedule>
                            </TabPanel>
                            <TabPanel>
                                <TableSchedule
                                    listSchedule={getListSchedule('future')}
                                    time="future"
                                ></TableSchedule>
                            </TabPanel>
                        </Tabs>
                    ) : (
                        <div className="d-flex justify-content-center mt-3">
                            <h4>Bạn chưa có lịch trình hoạt động</h4>
                        </div>
                    )}
                </CRow>
            )}
            {loading && (
                <div className="d-flex justify-content-center">
                    <CSpinner />
                </div>
            )}
            {!loading && listTrip.length === 0 && (
                <div className="d-flex justify-content-center">
                    <h3>Bạn chưa được phân công tuyến xe nào</h3>
                </div>
            )}
        </>
    )
}

export default DriverTrip
