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
    CButtonGroup,
    CFormCheck,
    CCard,
    CCardBody,
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
import { convertTimeToInt } from 'src/utils/convertUtils'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { dayInWeek } from 'src/utils/constants'
import MediaQuery from 'react-responsive'
import { useMediaQuery } from 'react-responsive'
const ScheduleWrap = ({ schedule }) => {
    const getScheduleColor = () => {
        if (schedule.tripInfor && schedule.tripInfor.turn === true) return 'success'
        else return 'warning'
    }
    return (
        <CTable bordered className="mb-1">
            <CTableBody>
                <CTableRow>
                    <CTableDataCell className="text-center p-0">
                        <CCard color={getScheduleColor()} style={{ borderRadius: '0' }}>
                            <CCardBody className="p-1">
                                <b>{schedule.departTime.slice(0, -3)}</b>
                                <br></br>
                                <span>{schedule.bus ? schedule.bus.licensePlate : '---'}</span>
                            </CCardBody>
                        </CCard>
                    </CTableDataCell>
                </CTableRow>
            </CTableBody>
        </CTable>
    )
}
const ScheduleAsTable = ({ currentList, startDate }) => {
    const filterTime = (listSchd, time) => {
        if (time === 'morning')
            return listSchd.filter(
                (schd) =>
                    convertTimeToInt(schd.departTime) >= 6 &&
                    convertTimeToInt(schd.departTime) < 12,
            )
        else if (time === 'afternoon')
            return listSchd.filter(
                (schd) =>
                    convertTimeToInt(schd.departTime) >= 12 &&
                    convertTimeToInt(schd.departTime) < 18,
            )
        else if (time === 'evening')
            return listSchd.filter(
                (schd) =>
                    convertTimeToInt(schd.departTime) >= 18 &&
                    convertTimeToInt(schd.departTime) < 24,
            )
        else
            return listSchd.filter(
                (schd) =>
                    convertTimeToInt(schd.departTime) >= 0 && convertTimeToInt(schd.departTime) < 6,
            )
    }
    const validDate = (schd, index) => {
        const dayStart = new Date(startDate)
        const schdDate = new Date(schd.departDate).getDate()
        const weekDate = new Date(dayStart.setDate(dayStart.getDate() + index)).getDate()
        return schdDate === weekDate
    }
    return (
        <>
            <CTable stripedColumns bordered className="mt-3">
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell scope="col">Buổi</CTableHeaderCell>
                        {Array.from({ length: 7 }, (_, index) => index).map((dayIndex) => (
                            <CTableHeaderCell key={dayIndex} className="text-center" scope="col">
                                <b>
                                    <i>{dayInWeek[dayIndex]}</i>
                                </b>
                                <div>
                                    {format(
                                        new Date(startDate.getTime() + dayIndex * 86400000),
                                        'dd/MM',
                                    )}
                                </div>
                            </CTableHeaderCell>
                        ))}
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    <CTableRow color="success">
                        <CTableHeaderCell scope="row">
                            <i>Sáng</i>
                            <div>{`(6h-12h)`}</div>
                        </CTableHeaderCell>
                        {Array.from({ length: 7 }, (_, index) => index).map((dayIndex) => (
                            <CTableDataCell key={dayIndex}>
                                {filterTime(
                                    currentList.filter(
                                        (schedule) => validDate(schedule, dayIndex) === true,
                                    ),
                                    'morning',
                                ).map((schedule) => (
                                    <ScheduleWrap
                                        key={schedule.id}
                                        schedule={schedule}
                                    ></ScheduleWrap>
                                ))}
                            </CTableDataCell>
                        ))}
                    </CTableRow>
                    <CTableRow color="primary">
                        <CTableHeaderCell scope="row">
                            <i>Chiều</i>
                            <div>{`(12h-18h)`}</div>
                        </CTableHeaderCell>
                        {Array.from({ length: 7 }, (_, index) => index).map((dayIndex) => (
                            <CTableDataCell key={dayIndex}>
                                {filterTime(
                                    currentList.filter(
                                        (schedule) => validDate(schedule, dayIndex) === true,
                                    ),
                                    'afternoon',
                                ).map((schedule) => (
                                    <ScheduleWrap
                                        key={schedule.id}
                                        schedule={schedule}
                                    ></ScheduleWrap>
                                ))}
                            </CTableDataCell>
                        ))}
                    </CTableRow>
                    <CTableRow color="info">
                        <CTableHeaderCell scope="row">
                            <i>Tối</i>
                            <div>{`(18h-24h)`}</div>
                        </CTableHeaderCell>
                        {Array.from({ length: 7 }, (_, index) => index).map((dayIndex) => (
                            <CTableDataCell key={dayIndex}>
                                {filterTime(
                                    currentList.filter(
                                        (schedule) => validDate(schedule, dayIndex) === true,
                                    ),
                                    'evening',
                                ).map((schedule) => (
                                    <ScheduleWrap
                                        key={schedule.id}
                                        schedule={schedule}
                                    ></ScheduleWrap>
                                ))}
                            </CTableDataCell>
                        ))}
                    </CTableRow>
                    <CTableRow color="warning">
                        <CTableHeaderCell scope="row">
                            <i>Khuya</i>
                            <div>{`(0h-6h)`}</div>
                        </CTableHeaderCell>
                        {Array.from({ length: 7 }, (_, index) => index).map((dayIndex) => (
                            <CTableDataCell key={dayIndex}>
                                {filterTime(
                                    currentList.filter(
                                        (schedule) => validDate(schedule, dayIndex) === true,
                                    ),
                                    'late',
                                ).map((schedule) => (
                                    <ScheduleWrap
                                        key={schedule.id}
                                        schedule={schedule}
                                    ></ScheduleWrap>
                                ))}
                            </CTableDataCell>
                        ))}
                    </CTableRow>
                </CTableBody>
            </CTable>
            <div className="d-flex gap-2 align-items-center">
                <i>Ghi chú</i>
                <CCard color="success">
                    <CCardBody className="p-1">Chuyến đi</CCardBody>
                </CCard>
                <CCard color="warning">
                    <CCardBody className="p-1">Chuyến về</CCardBody>
                </CCard>
            </div>
        </>
    )
}
const ScheduleAsList = ({ listSchedule, time }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const listTrip = useSelector(selectDriverTrip)
    const [listGo, setListGo] = useState([])
    const [listReturn, setListReturn] = useState([])
    const [showDetailBus, setShowDetailBus] = useState(false)
    const sortTime = (a, b) => {
        const timeA = new Date(a.departDate + 'T' + a.departTime).getTime()
        const timeB = new Date(b.departDate + 'T' + b.departTime).getTime()
        const today = new Date().getTime()
        const distanceA = timeA - today
        const distanceB = timeB - today
        const diff = Math.abs(distanceA) - Math.abs(distanceB)
        if (distanceA > 0 && distanceB < 0) return -1
        else if (distanceA < 0 && distanceB > 0) return 1
        else {
            if (diff < 0) return -1
            else if (diff > 0) return 1
            else return 0
        }
    }
    const getCurrentTrip = (schedule) => {
        dispatch(driverAction.setCurrentTrip(schedule.tripInfor))
        dispatch(driverAction.setCurrentSchedule(schedule))
        dispatch(driverAction.setCurrentTripTimeProps(time))
        navigate('detail')
    }
    const handleShowBusDetail = (bus) => {
        dispatch(driverAction.setCurrentBus(bus))
        setShowDetailBus(true)
    }
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
                        {listSchedule.sort(sortTime).map((schedule, index) => (
                            <CTableRow key={index}>
                                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                <CTableDataCell className="text-center">
                                    {schedule.tripInfor &&
                                        schedule.tripInfor.turn === true &&
                                        'Lượt đi'}
                                    {schedule.tripInfor &&
                                        schedule.tripInfor.turn === false &&
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
                                                id={'bus-detail-' + schedule.bus.licensePlate}
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
    const [turnList, setTurnList] = useState(listSchedule)
    const [currentList, setCurrentList] = useState(listSchedule)
    const [listForm, setListForm] = useState('list')
    const [currentDay, setCurrentDay] = useState(new Date())
    const [startDate, setStartDate] = useState(startOfWeek(currentDay, { weekStartsOn: 1 }))
    const [endDate, setEndDate] = useState(endOfWeek(currentDay, { weekStartsOn: 1 }))
    const isBigScreen = useMediaQuery({ query: '(min-width: 878px)' })
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 878px)' })
    useEffect(() => {
        setCurrentList(
            turnList.filter(
                (schd) =>
                    new Date(schd.departDate) >= startDate && new Date(schd.departDate) <= endDate,
            ),
        )
    }, [startDate, endDate, turnList])
    useEffect(() => {
        setStartDate(startOfWeek(currentDay, { weekStartsOn: 1 }))
        setEndDate(endOfWeek(currentDay, { weekStartsOn: 1 }))
    }, [currentDay])
    useEffect(() => {
        if (listSchedule.length > 0 && listTrip.length > 0) {
            const listGo = listTrip.find((tp) => tp.turn === true)
            const listReturn = listTrip.find((tp) => tp.turn === false)
            const tempList = []
            if (listGo) {
                listSchedule.forEach((schedule) => {
                    if (
                        listGo.schedules &&
                        listGo.schedules.find((schd) => schd.id === schedule.id)
                    )
                        tempList.push({
                            ...schedule,
                            tripInfor: listGo,
                        })
                    else {
                        tempList.push({
                            ...schedule,
                            tripInfor: listReturn,
                        })
                    }
                })
                setTurnList(tempList)
            }
        }
    }, [listSchedule.length, listTrip.length])

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
            if (time === 'past') result = currentList.filter((schd) => getTimeEndSpan(schd) <= 0)
            else if (time === 'current')
                result = currentList.filter(
                    (schd) => getTimeEndSpan(schd) >= 0 && getTimeStartSpan(schd) <= 60 * 60 * 1000,
                )
            else result = currentList.filter((schd) => getTimeStartSpan(schd) >= 60 * 60 * 1000)
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
            <CRow className="my-3 gap-3">
                <CCol
                    md={6}
                    sm={12}
                    style={{ textAlign: 'right' }}
                    className={`d-flex gap-1 customDatePicker ${
                        isTabletOrMobile ? 'flex-column' : 'align-items-center'
                    }`}
                >
                    <div className="d-flex align-items-center gap-1">
                        <b>
                            <i>Ngày</i>
                        </b>
                        <DatePicker
                            selected={currentDay}
                            onChange={setCurrentDay}
                            dateFormat="dd/MM/yyyy"
                            showWeekNumbers
                        />
                    </div>
                    <div className="d-flex align-items-center gap-1">
                        <b>
                            <i>{` Tuần`}</i>
                        </b>
                        <CFormInput
                            value={`${format(startDate, 'dd/MM/yyyy')} - ${format(
                                endDate,
                                'dd/MM/yyyy',
                            )}`}
                            disabled
                            style={{ width: '250px', marrginLeft: '10px' }}
                        ></CFormInput>
                    </div>
                </CCol>
                <CCol
                    md={6}
                    sm={12}
                    style={isBigScreen ? { textAlign: 'right' } : { textAlign: 'center' }}
                >
                    <CButtonGroup role="group" aria-label="Form option" color="info">
                        <CFormCheck
                            type="radio"
                            button={{ color: 'primary', variant: 'outline' }}
                            name="btnradio"
                            id="btnradio1"
                            autoComplete="off"
                            label="Danh sách"
                            checked={listForm === 'list'}
                            onChange={() => setListForm('list')}
                        />
                        <CFormCheck
                            type="radio"
                            button={{ color: 'primary', variant: 'outline' }}
                            name="btnradio"
                            id="btnradio2"
                            autoComplete="off"
                            label="Lịch trình"
                            checked={listForm === 'table'}
                            onChange={() => setListForm('table')}
                        />
                    </CButtonGroup>
                </CCol>
            </CRow>
            {listTrip.length !== 0 && (
                <>
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
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                        {listForm === 'list' ? (
                            <CRow className="tabStyle">
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
                                            <ScheduleAsList
                                                listSchedule={getListSchedule('past')}
                                                time="past"
                                            ></ScheduleAsList>
                                        </TabPanel>
                                        <TabPanel>
                                            <ScheduleAsList
                                                listSchedule={getListSchedule('current')}
                                                time="current"
                                            ></ScheduleAsList>
                                        </TabPanel>
                                        <TabPanel>
                                            <ScheduleAsList
                                                listSchedule={getListSchedule('future')}
                                                time="future"
                                            ></ScheduleAsList>
                                        </TabPanel>
                                    </Tabs>
                                ) : (
                                    <div className="d-flex justify-content-center mt-3">
                                        <h4>Bạn chưa có lịch trình hoạt động</h4>
                                    </div>
                                )}
                            </CRow>
                        ) : (
                            <ScheduleAsTable
                                currentList={currentList}
                                startDate={startDate}
                            ></ScheduleAsTable>
                        )}
                    </div>
                </>
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
