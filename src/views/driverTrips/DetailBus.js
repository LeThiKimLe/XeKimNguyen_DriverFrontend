import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import busThunk from 'src/feature/bus/bus.service'
import { selectListBus } from 'src/feature/bus/bus.slice'
import { selectListBusType } from 'src/feature/bus/bus.slice'
import { CCollapse, CFormCheck } from '@coreui/react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import {
    CAccordion,
    CAccordionBody,
    CAccordionItem,
    CAccordionHeader,
    CCard,
    CRow,
    CCol,
    CCardBody,
    CForm,
    CFormInput,
    CFormSelect,
    CFormLabel,
    CFormFeedback,
    CButton,
    CCardFooter,
    CToaster,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CCardHeader,
    CModalFooter,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CButtonGroup,
    CTableDataCell,
} from '@coreui/react'
import CustomButton from '../customButton/CustomButton'
import { CustomToast } from '../customToast/CustomToast'
import { convertToDisplayDate, convertToDisplayTimeStamp } from 'src/utils/convertUtils'
import format from 'date-fns/format'
import { cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { selectListRoute } from 'src/feature/route/route.slice'
import { getRouteJourney, getTripJourney } from 'src/utils/tripUtils'
import routeThunk from 'src/feature/route/route.service'
import driverThunk from 'src/feature/driver/driver.service'
import { selectCurrentBus } from 'src/feature/driver/driver.slice'
import { startOfWeek, endOfWeek, parse } from 'date-fns'
import { dayInWeek } from 'src/utils/constants'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { selectUser } from 'src/feature/auth/auth.slice'
import { convertTimeToInt } from 'src/utils/convertUtils'

const ScheduleWrap = ({ schedule }) => {
    const currentUser = useSelector(selectUser)
    const getScheduleColor = () => {
        if (schedule.turn === true) return 'success'
        else return 'warning'
    }
    const abbreviateName = (fullName) => {
        const nameParts = fullName.split(' ')
        if (nameParts.length === 1) {
            return fullName
        }
        const abbreviatedParts = nameParts.map((part, index) => {
            if (index === nameParts.length - 1) {
                return part
            } else {
                return part[0] + '.'
            }
        })
        return abbreviatedParts.join('')
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
                                <span>
                                    {schedule.driverUser &&
                                    currentUser.user.driver.driverId ===
                                        schedule.driverUser.driver.driverId
                                        ? abbreviateName(schedule.driverUser.name)
                                        : '---'}
                                </span>
                            </CCardBody>
                        </CCard>
                    </CTableDataCell>
                </CTableRow>
            </CTableBody>
        </CTable>
    )
}
const BusScheduleHistory = ({ listSchedule, listTrip }) => {
    const [turnList, setTurnList] = useState(listSchedule)
    const [currentList, setCurrentList] = useState(listSchedule)
    const [listFormOption, setListFormOption] = useState('list')
    const [currentDay, setCurrentDay] = useState(new Date())
    const [startDate, setStartDate] = useState(startOfWeek(currentDay, { weekStartsOn: 1 }))
    const [endDate, setEndDate] = useState(endOfWeek(currentDay, { weekStartsOn: 1 }))
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
            const tempList = []
            if (listGo) {
                listSchedule.forEach((schedule) => {
                    if (
                        listGo.schedules &&
                        listGo.schedules.find((schd) => schd.id === schedule.id)
                    )
                        tempList.push({
                            ...schedule,
                            turn: true,
                        })
                    else {
                        tempList.push({
                            ...schedule,
                            turn: false,
                        })
                    }
                })
                setTurnList(tempList)
            }
        }
    }, [listSchedule.length, listTrip.length])
    return (
        <>
            <CRow className="my-3">
                <CCol
                    style={{ textAlign: 'right' }}
                    className="d-flex align-items-center gap-1 customDatePicker"
                >
                    <b>
                        <i>Ngày</i>
                    </b>
                    <DatePicker
                        selected={currentDay}
                        onChange={setCurrentDay}
                        dateFormat="dd/MM/yyyy"
                        showWeekNumbers
                    />
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
                </CCol>
                <CCol style={{ textAlign: 'right' }}>
                    <CButtonGroup role="group" aria-label="Form option" color="info">
                        <CFormCheck
                            type="radio"
                            button={{ color: 'primary', variant: 'outline' }}
                            name="btnradio1"
                            id="btnradio3"
                            autoComplete="off"
                            label="Danh sách"
                            checked={listFormOption === 'list'}
                            onChange={() => setListFormOption('list')}
                        />
                        <CFormCheck
                            type="radio"
                            button={{ color: 'primary', variant: 'outline' }}
                            name="btnradio1"
                            id="btnradio4"
                            autoComplete="off"
                            label="Lịch trình"
                            checked={listFormOption === 'table'}
                            onChange={() => setListFormOption('table')}
                        />
                    </CButtonGroup>
                </CCol>
            </CRow>
            {listFormOption === 'list' && (
                <CTable>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell scope="col">#</CTableHeaderCell>
                            <CTableHeaderCell className="text-center" scope="col">
                                Lượt xe
                            </CTableHeaderCell>
                            <CTableHeaderCell className="text-center" scope="col">
                                Ngày khởi hành
                            </CTableHeaderCell>
                            <CTableHeaderCell className="text-center" scope="col">
                                Giờ khởi hành
                            </CTableHeaderCell>
                            <CTableHeaderCell className="text-center" scope="col">
                                Giờ kết thúc
                            </CTableHeaderCell>
                            <CTableHeaderCell className="text-center" scope="col">
                                Tài xế
                            </CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {currentList
                            .sort((a, b) => sortTime(a, b))
                            .map((schedule, index) => (
                                <CTableRow key={index}>
                                    <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                    <CTableDataCell className="text-center">
                                        {schedule.turn === true ? 'Lượt đi' : 'Lượt về'}
                                    </CTableDataCell>
                                    <CTableDataCell className="text-center">
                                        {convertToDisplayDate(schedule.departDate)}
                                    </CTableDataCell>
                                    <CTableDataCell className="text-center">
                                        {schedule.departTime.slice(0, -3)}
                                    </CTableDataCell>
                                    <CTableDataCell className="text-center">
                                        {schedule.finishTime === '00:00:00'
                                            ? 'Đang cập nhật'
                                            : schedule.finishTime.slice(0, -3)}
                                    </CTableDataCell>
                                    <CTableDataCell className="text-center">
                                        {schedule.driverUser
                                            ? schedule.driverUser.name
                                            : 'Đang cập nhật'}
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                    </CTableBody>
                </CTable>
            )}
            {listFormOption === 'table' && (
                <>
                    <CTable stripedColumns bordered>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell scope="col">Buổi</CTableHeaderCell>
                                {Array.from({ length: 7 }, (_, index) => index).map((dayIndex) => (
                                    <CTableHeaderCell
                                        key={dayIndex}
                                        className="text-center"
                                        scope="col"
                                    >
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
                                                (schedule) =>
                                                    validDate(schedule, dayIndex) === true,
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
                                                (schedule) =>
                                                    validDate(schedule, dayIndex) === true,
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
                                                (schedule) =>
                                                    validDate(schedule, dayIndex) === true,
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
                                                (schedule) =>
                                                    validDate(schedule, dayIndex) === true,
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
            )}
        </>
    )
}

const DetailBus = ({ visible, setVisible }) => {
    const bus = useSelector(selectCurrentBus)
    const [isUpdatingState, setIsUpdatingState] = useState(false)
    const [validateState, setValidateState] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [toast, addToast] = useState(0)
    const dispatch = useDispatch()
    const toaster = useRef('')
    const [updateTime, setUpdateTime] = useState(
        bus ? bus.state.updatedAt : format(new Date(), 'yyyy-MM-dd'),
    )
    const [busState, setBusState] = useState(bus ? bus.state : null)
    const [listTrip, setListTrip] = useState([])
    const [listSchedule, setListSchedule] = useState([])
    const [route, setRoute] = useState(0)
    const [tripBus, setTripBus] = useState(0)
    const listRoute = useSelector(selectListRoute)
    const setBusStateAttribute = (e) => {
        setBusState({
            ...busState,
            [e.target.name]: e.target.value,
        })
    }
    const handleEditBusState = (event) => {
        event.preventDefault()
        if (isUpdatingState) {
            const form = event.currentTarget
            if (form.checkValidity() === false) {
                event.stopPropagation()
            } else {
                setValidateState(true)
                dispatch(driverThunk.updateBusState({ id: bus.id, busState: busState }))
                    .unwrap()
                    .then(() => {
                        setError('')
                        addToast(() =>
                            CustomToast({ message: 'Đã cập nhật thành công', type: 'success' }),
                        )
                        setIsUpdatingState(false)
                        setUpdateTime(format(new Date(), 'yyyy-MM-dd'))
                    })
                    .catch((error) => {
                        setError(error)
                    })
            }
            setValidateState(true)
        } else {
            setIsUpdatingState(true)
        }
    }
    const reloadListBus = () => {
        dispatch(busThunk.getBus())
            .unwrap()
            .then(() => {})
            .catch(() => {})
    }

    const resetState = () => {
        setValidateState(false)
        setBusState(bus ? bus.state : null)
        setError('')
    }
    const handleCancelEditState = () => {
        setIsUpdatingState(false)
        resetState()
    }

    useEffect(() => {
        if (bus && visible) {
            dispatch(busThunk.getTrips(bus.id))
                .unwrap()
                .then((rep) => {
                    setListTrip(rep)
                })
                .catch(() => {})
            dispatch(busThunk.getSchedules(bus.id))
                .unwrap()
                .then((rep) => {
                    setListSchedule(rep)
                })
                .catch(() => {})
            setBusState(bus.state)
            setUpdateTime(bus.state.updatedAt)
        }
    }, [bus, visible])
    return (
        <>
            <CToaster ref={toaster} push={toast} placement="top-end" />
            {bus && busState && (
                <CModal
                    className="mb-2"
                    size="xl"
                    alignment="center"
                    backdrop="static"
                    visible={visible}
                    onClose={() => setVisible(false)}
                >
                    <CModalHeader>
                        <b>{bus.licensePlate}</b>
                    </CModalHeader>
                    <CModalBody id={bus.licensePlate} className="tabStyle">
                        <Tabs>
                            <TabList>
                                <Tab>Thông tin cơ bản</Tab>
                                <Tab>Tình trạng xe</Tab>
                                <Tab>Hoạt động</Tab>
                            </TabList>
                            <TabPanel>
                                <CRow className="justify-content-center">
                                    <CCol md="10">
                                        <CCard className="mt-1 p-0">
                                            <CCardBody>
                                                <CForm className="w-100">
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="license"
                                                            className="col-sm-2 col-form-label"
                                                        >
                                                            <b>Biển số xe</b>
                                                        </CFormLabel>
                                                        <CCol sm={8}>
                                                            <CFormInput
                                                                type="text"
                                                                id="license"
                                                                disabled={true}
                                                                defaultValue={bus.licensePlate}
                                                            />
                                                        </CCol>
                                                    </CRow>
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="year"
                                                            className="col-sm-2 col-form-label"
                                                        >
                                                            <b>Năm sản xuất</b>
                                                        </CFormLabel>
                                                        <CCol sm={3}>
                                                            <CFormInput
                                                                type="number"
                                                                id="year"
                                                                disabled={true}
                                                                defaultValue={bus.manufactureYear}
                                                            />
                                                        </CCol>
                                                        <CFormLabel
                                                            htmlFor="color"
                                                            className="col-sm-2 col-form-label"
                                                        >
                                                            <b>Màu sắc</b>
                                                        </CFormLabel>
                                                        <CCol sm={3}>
                                                            <CFormInput
                                                                type="text"
                                                                id="color"
                                                                disabled={true}
                                                                defaultValue={bus.color}
                                                            />
                                                            <CFormFeedback invalid>
                                                                Màu sắc không được để trống
                                                            </CFormFeedback>
                                                        </CCol>
                                                    </CRow>
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="busType"
                                                            className="col-sm-2 col-form-label"
                                                        >
                                                            <b>Loại xe</b>
                                                        </CFormLabel>
                                                        <CCol sm={8}>
                                                            <CFormInput
                                                                type="text"
                                                                id="color"
                                                                disabled={true}
                                                                defaultValue={bus.type.description}
                                                            />
                                                        </CCol>
                                                    </CRow>
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="state"
                                                            className="col-sm-2 col-form-label"
                                                        >
                                                            <b>Tình trạng</b>
                                                        </CFormLabel>
                                                        <CCol sm={8}>
                                                            <CFormInput
                                                                type="text"
                                                                id="color"
                                                                disabled={true}
                                                                defaultValue={bus.availability}
                                                            />
                                                        </CCol>
                                                    </CRow>
                                                </CForm>
                                            </CCardBody>
                                        </CCard>
                                    </CCol>
                                </CRow>
                            </TabPanel>
                            <TabPanel>
                                <CRow className="justify-content-center">
                                    <CCol md="10">
                                        <CCard className="mt-1 p-0">
                                            <CCardBody>
                                                <CForm
                                                    className="w-100"
                                                    noValidate
                                                    validated={validateState}
                                                    onSubmit={handleEditBusState}
                                                >
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="brake"
                                                            className="col-sm-4 col-form-label"
                                                        >
                                                            <b>Hệ thống phanh</b>
                                                        </CFormLabel>
                                                        <CCol sm={8}>
                                                            <CFormInput
                                                                type="text"
                                                                id="brake"
                                                                name="brake"
                                                                required
                                                                disabled={!isUpdatingState}
                                                                value={busState.brake}
                                                                onChange={(e) =>
                                                                    setBusStateAttribute(e)
                                                                }
                                                            />
                                                            <CFormFeedback invalid>
                                                                Vui lòng điền tình trạng của thuộc
                                                                tính này
                                                            </CFormFeedback>
                                                        </CCol>
                                                    </CRow>
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="lighting"
                                                            className="col-sm-4 col-form-label"
                                                        >
                                                            <b>Hệ thống chiếu sáng</b>
                                                        </CFormLabel>
                                                        <CCol sm={8}>
                                                            <CFormInput
                                                                type="text"
                                                                id="lighting"
                                                                name="lighting"
                                                                required
                                                                disabled={!isUpdatingState}
                                                                value={busState.lighting}
                                                                onChange={(e) =>
                                                                    setBusStateAttribute(e)
                                                                }
                                                            />
                                                            <CFormFeedback invalid>
                                                                Vui lòng điền tình trạng của thuộc
                                                                tính này
                                                            </CFormFeedback>
                                                        </CCol>
                                                    </CRow>
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="tire"
                                                            className="col-sm-4 col-form-label"
                                                        >
                                                            <b>Hệ thống bánh xe</b>
                                                        </CFormLabel>
                                                        <CCol sm={8}>
                                                            <CFormInput
                                                                type="text"
                                                                id="tire"
                                                                name="tire"
                                                                required
                                                                disabled={!isUpdatingState}
                                                                value={busState.tire}
                                                                onChange={(e) =>
                                                                    setBusStateAttribute(e)
                                                                }
                                                            />
                                                            <CFormFeedback invalid>
                                                                Vui lòng điền tình trạng của thuộc
                                                                tính này
                                                            </CFormFeedback>
                                                        </CCol>
                                                    </CRow>
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="steering"
                                                            className="col-sm-4 col-form-label"
                                                        >
                                                            <b>Hệ thống lái</b>
                                                        </CFormLabel>
                                                        <CCol sm={8}>
                                                            <CFormInput
                                                                type="text"
                                                                id="steering"
                                                                name="steering"
                                                                required
                                                                disabled={!isUpdatingState}
                                                                value={busState.steering}
                                                                onChange={(e) =>
                                                                    setBusStateAttribute(e)
                                                                }
                                                            />
                                                            <CFormFeedback invalid>
                                                                Vui lòng điền tình trạng của thuộc
                                                                tính này
                                                            </CFormFeedback>
                                                        </CCol>
                                                    </CRow>
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="mirror"
                                                            className="col-sm-4 col-form-label"
                                                        >
                                                            <b>Hệ thống gương xe</b>
                                                        </CFormLabel>
                                                        <CCol sm={8}>
                                                            <CFormInput
                                                                type="text"
                                                                id="mirror"
                                                                name="mirror"
                                                                required
                                                                disabled={!isUpdatingState}
                                                                value={busState.mirror}
                                                                onChange={(e) =>
                                                                    setBusStateAttribute(e)
                                                                }
                                                            />
                                                            <CFormFeedback invalid>
                                                                Vui lòng điền tình trạng của thuộc
                                                                tính này
                                                            </CFormFeedback>
                                                        </CCol>
                                                    </CRow>
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="airCondition"
                                                            className="col-sm-4 col-form-label"
                                                        >
                                                            <b>Hệ thống điều hòa</b>
                                                        </CFormLabel>
                                                        <CCol sm={8}>
                                                            <CFormInput
                                                                type="text"
                                                                id="airCondition"
                                                                name="airCondition"
                                                                required
                                                                disabled={!isUpdatingState}
                                                                value={busState.airCondition}
                                                                onChange={(e) =>
                                                                    setBusStateAttribute(e)
                                                                }
                                                            />
                                                            <CFormFeedback invalid>
                                                                Vui lòng điền tình trạng của thuộc
                                                                tính này
                                                            </CFormFeedback>
                                                        </CCol>
                                                    </CRow>
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="electric"
                                                            className="col-sm-4 col-form-label"
                                                        >
                                                            <b>Hệ thống điện</b>
                                                        </CFormLabel>
                                                        <CCol sm={8}>
                                                            <CFormInput
                                                                type="text"
                                                                id="electric"
                                                                name="electric"
                                                                required
                                                                disabled={!isUpdatingState}
                                                                value={busState.electric}
                                                                onChange={(e) =>
                                                                    setBusStateAttribute(e)
                                                                }
                                                            />
                                                            <CFormFeedback invalid>
                                                                Vui lòng điền tình trạng của thuộc
                                                                tính này
                                                            </CFormFeedback>
                                                        </CCol>
                                                    </CRow>
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="fuel"
                                                            className="col-sm-4 col-form-label"
                                                        >
                                                            <b>Hệ thống nhiên liệu</b>
                                                        </CFormLabel>
                                                        <CCol sm={8}>
                                                            <CFormInput
                                                                type="text"
                                                                id="fuel"
                                                                name="fuel"
                                                                required
                                                                disabled={!isUpdatingState}
                                                                value={busState.fuel}
                                                                onChange={(e) =>
                                                                    setBusStateAttribute(e)
                                                                }
                                                            />
                                                            <CFormFeedback invalid>
                                                                Vui lòng điền tình trạng của thuộc
                                                                tính này
                                                            </CFormFeedback>
                                                        </CCol>
                                                    </CRow>
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="overallState"
                                                            className="col-sm-4 col-form-label"
                                                        >
                                                            <b>Đánh giá chung</b>
                                                        </CFormLabel>
                                                        <CCol sm={8}>
                                                            <CFormInput
                                                                type="text"
                                                                id="overallState"
                                                                name="overallState"
                                                                required
                                                                disabled={!isUpdatingState}
                                                                value={busState.overallState}
                                                                onChange={(e) =>
                                                                    setBusStateAttribute(e)
                                                                }
                                                            />
                                                            <CFormFeedback invalid>
                                                                Vui lòng điền tình trạng của thuộc
                                                                tính này
                                                            </CFormFeedback>
                                                        </CCol>
                                                    </CRow>
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CFormLabel
                                                            htmlFor="time"
                                                            className="col-sm-4 col-form-label"
                                                        >
                                                            <b>Cập nhật mới nhất lúc: </b>
                                                        </CFormLabel>
                                                        <CCol sm={8}>
                                                            <CFormInput
                                                                type="text"
                                                                required
                                                                disabled
                                                                defaultValue={convertToDisplayDate(
                                                                    updateTime,
                                                                )}
                                                            />
                                                        </CCol>
                                                    </CRow>
                                                    <CRow className="mb-3 justify-content-center">
                                                        <CustomButton
                                                            text={
                                                                !isUpdatingState
                                                                    ? 'Cập nhật thông tin'
                                                                    : 'Lưu'
                                                            }
                                                            type="submit"
                                                            loading={loading}
                                                            color="success"
                                                            style={{
                                                                width: '200px',
                                                                marginRight: '10px',
                                                            }}
                                                        ></CustomButton>
                                                        {isUpdatingState && (
                                                            <CButton
                                                                variant="outline"
                                                                style={{ width: '100px' }}
                                                                color="danger"
                                                                onClick={handleCancelEditState}
                                                            >
                                                                Hủy
                                                            </CButton>
                                                        )}
                                                    </CRow>
                                                </CForm>
                                            </CCardBody>
                                        </CCard>
                                    </CCol>
                                </CRow>
                            </TabPanel>
                            <TabPanel>
                                <CRow className="justify-content-center">
                                    <CCol md="10">
                                        <CCard className="mt-1 p-0">
                                            <CCardBody>
                                                {listTrip.length === 0 && (
                                                    <>
                                                        <b>
                                                            Xe hiện chưa được phân cho tuyến xe nào
                                                        </b>
                                                    </>
                                                )}
                                                {listTrip.length > 0 && (
                                                    <CCard className="p-3">
                                                        <b>Hoạt động tuyến: </b>
                                                        <b>{getTripJourney(listTrip[0])}</b>
                                                    </CCard>
                                                )}
                                                <div className="w-100 border-top border-1 mt-3 mb-3"></div>
                                                <b>
                                                    <i>Lịch sử hoạt động</i>
                                                </b>
                                                <br></br>
                                                {listSchedule.length === 0 && (
                                                    <i>Xe chưa hoạt động chuyến nào</i>
                                                )}
                                                {listSchedule.length > 0 && (
                                                    <BusScheduleHistory
                                                        listSchedule={listSchedule}
                                                        listTrip={listTrip}
                                                    ></BusScheduleHistory>
                                                )}
                                            </CCardBody>
                                        </CCard>
                                    </CCol>
                                </CRow>
                            </TabPanel>
                        </Tabs>
                    </CModalBody>
                </CModal>
            )}
        </>
    )
}

export default DetailBus
