import { CCardHeader, CFormLabel } from '@coreui/react'
import React from 'react'
import { getDateAndTimeSchedule } from 'src/utils/tripUtils'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentTrip } from 'src/feature/driver/driver.slice'
import { selectDriverRoute } from 'src/feature/driver/driver.slice'
import { selectListTicket } from 'src/feature/driver/driver.slice'
import driverThunk from 'src/feature/driver/driver.service'
import { useState, useEffect } from 'react'
import { CCard, CRow, CCardSubtitle, CCardBody, CFormInput, CCol, CSpinner } from '@coreui/react'
import { Tab, TabPanel, Tabs, TabList } from 'react-tabs'
import Ticket from './Ticket'
import { convertToDisplayDate } from 'src/utils/convertUtils'
import { getTripStartStation, getTripEndStation } from 'src/utils/tripUtils'
import { selectCurrentSchedule, selectCurrentTime } from 'src/feature/driver/driver.slice'
const DetailTrip = () => {
    const schedule = useSelector(selectCurrentSchedule)
    const currentTrip = useSelector(selectCurrentTrip)
    const driverRoute = useSelector(selectDriverRoute)
    const seatMap = driverRoute ? driverRoute.busType.seatMap : null
    const [activeSeat, setActiveSeat] = useState(0)
    const dispatch = useDispatch()
    const listTicket = useSelector(selectListTicket)
    const [loading, setLoading] = useState(false)
    const getSeatTicket = (seat) => {
        return listTicket.filter((tk) => tk.seat === seat.name && tk.state !== 'Đã hủy')[0]
    }
    const handleChooseSeat = (seat) => {
        if (activeSeat === seat) setActiveSeat('')
        else setActiveSeat(seat)
    }
    const getColWidth = () => {
        if (seatMap.colNo === 3) return '3'
        else if (seatMap.colNo === 4) return '3'
        else return '2'
    }
    const updateListTicket = () => {
        dispatch(driverThunk.getScheduleInfor(schedule.id))
            .unwrap()
            .then(() => {})
            .catch(() => {})
    }
    useEffect(() => {
        setLoading(true)
        dispatch(driverThunk.getScheduleInfor(schedule.id))
            .unwrap()
            .then(() => {
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }, [])
    return (
        <>
            {currentTrip && (
                <CCard>
                    <CCardHeader className="bg-info">
                        <b>Thông tin chuyến xe</b>
                    </CCardHeader>
                    <CCardBody>
                        <CCard className="mt-1 p-3">
                            <CCardSubtitle>
                                Thời gian khởi hành
                                <strong>{` ${schedule.departTime.slice(0, -3)} `}</strong>
                                ngày
                                <strong> {` ${convertToDisplayDate(schedule.departDate)} `}</strong>
                            </CCardSubtitle>
                            <CCardBody>
                                <CRow>
                                    <CCol md="6">
                                        <CRow className="mb-1 overflow-auto">
                                            <CFormLabel className="col-sm-4 col-form-label">
                                                <strong>Trạm đi:</strong>
                                            </CFormLabel>
                                            <CCol sm={8}>
                                                <CFormInput
                                                    type="text"
                                                    value={
                                                        currentTrip
                                                            ? getTripStartStation(currentTrip)
                                                            : 'Đang cập nhật'
                                                    }
                                                    readOnly
                                                    plainText
                                                />
                                            </CCol>
                                        </CRow>
                                        <CRow className="mb-1">
                                            <CFormLabel className="col-sm-4 col-form-label">
                                                <strong>Trạm đến:</strong>
                                            </CFormLabel>
                                            <CCol sm={8}>
                                                <CFormInput
                                                    type="text"
                                                    value={
                                                        currentTrip
                                                            ? getTripEndStation(currentTrip)
                                                            : 'Đang cập nhật'
                                                    }
                                                    readOnly
                                                    plainText
                                                />
                                            </CCol>
                                        </CRow>
                                        <CRow className="mb-1">
                                            <CFormLabel className="col-sm-4 col-form-label">
                                                <strong>Loại xe:</strong>
                                            </CFormLabel>
                                            <CCol sm={8}>
                                                <CFormInput
                                                    type="text"
                                                    value={
                                                        driverRoute
                                                            ? driverRoute.busType.description
                                                            : 'Đang cập nhật'
                                                    }
                                                    readOnly
                                                    plainText
                                                />
                                            </CCol>
                                        </CRow>
                                        <CRow className="mb-1 overflow-auto">
                                            <CFormLabel className="col-sm-4 col-form-label">
                                                <strong>Số xe:</strong>
                                            </CFormLabel>
                                            <CCol sm={8}>
                                                <CFormInput
                                                    type="text"
                                                    value={
                                                        schedule.bus
                                                            ? schedule.bus.licensePlate
                                                            : 'Đang cập nhật'
                                                    }
                                                    readOnly
                                                    plainText
                                                />
                                            </CCol>
                                        </CRow>
                                    </CCol>
                                    <CCol md="6" className="text-right">
                                        <CRow className="d-flex-end mb-1">
                                            <CCol sm={6}>
                                                Số chỗ đã đặt:
                                                <b>
                                                    {' '}
                                                    {`${
                                                        driverRoute.busType.capacity -
                                                        schedule.availability
                                                    }`}
                                                </b>
                                            </CCol>
                                            <CCol sm={6}>
                                                Tổng số chỗ:
                                                <b>{` ${driverRoute.busType.capacity}`}</b>
                                            </CCol>
                                        </CRow>
                                        <CRow className="mb-1">
                                            <CCol sm={6}>
                                                Đã thanh toán:
                                                <b>{` ${
                                                    listTicket.filter(
                                                        (ticket) =>
                                                            ticket.state === 'Đã thanh toán',
                                                    ).length
                                                }`}</b>
                                            </CCol>
                                            <CCol sm={6}>
                                                Chờ thanh toán:
                                                <b>{` ${
                                                    listTicket.filter(
                                                        (ticket) =>
                                                            ticket.state === 'Chờ thanh toán',
                                                    ).length
                                                }`}</b>
                                            </CCol>
                                        </CRow>
                                        <CRow className="mb-1">
                                            <CCol sm={6}>
                                                Đã lên xe:
                                                <b>{` ${
                                                    listTicket.filter(
                                                        (ticket) => ticket.checkedIn === true,
                                                    ).length
                                                }`}</b>
                                            </CCol>
                                        </CRow>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCardBody>
                </CCard>
            )}
            <CCard>
                {seatMap && !loading && (
                    <CRow>
                        <div className={`tabStyle`}>
                            <Tabs>
                                <TabList>
                                    {Array.from(
                                        { length: seatMap.floorNo },
                                        (_, index) => index + 1,
                                    ).map((floorNumber) => (
                                        <Tab key={floorNumber}>
                                            {floorNumber === 1 ? 'Tầng dưới' : 'Tầng trên'}
                                        </Tab>
                                    ))}
                                </TabList>
                                {Array.from(
                                    { length: seatMap.floorNo },
                                    (_, index) => index + 1,
                                ).map((floorNumber) => (
                                    <TabPanel key={floorNumber}>
                                        {Array.from(
                                            { length: seatMap.rowNo },
                                            (_, index) => index,
                                        ).map((rowNumber) => (
                                            <CRow
                                                key={rowNumber}
                                                className="justify-content-center"
                                            >
                                                {Array.from(
                                                    { length: seatMap.colNo },
                                                    (_, index) => index,
                                                ).map((colNumber) => {
                                                    const filteredSeats = seatMap.seats.filter(
                                                        (seat) =>
                                                            seat.floor === floorNumber &&
                                                            seat.row === rowNumber &&
                                                            seat.col === colNumber,
                                                    )
                                                    return filteredSeats.length > 0 ? (
                                                        filteredSeats.map((seat) => (
                                                            <CCol
                                                                md={getColWidth()}
                                                                key={seat.name}
                                                                className="d-flex justify-content-center"
                                                            >
                                                                <Ticket
                                                                    seat={seat}
                                                                    ticket={getSeatTicket(seat)}
                                                                    empty={false}
                                                                    updateList={updateListTicket}
                                                                />
                                                            </CCol>
                                                        ))
                                                    ) : (
                                                        <CCol
                                                            md={getColWidth()}
                                                            key={`${floorNumber}-${rowNumber}-${colNumber}`}
                                                        >
                                                            <Ticket empty={true} />
                                                        </CCol>
                                                    )
                                                })}
                                            </CRow>
                                        ))}
                                    </TabPanel>
                                ))}
                            </Tabs>
                        </div>
                    </CRow>
                )}
                {loading && (
                    <div className="d-flex justify-content-center">
                        <CSpinner />
                    </div>
                )}
            </CCard>
        </>
    )
}

export default DetailTrip
