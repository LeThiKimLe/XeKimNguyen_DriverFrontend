import { CButton, CCardHeader, CFormLabel, CModalFooter } from '@coreui/react'
import React from 'react'
import { getDateAndTimeSchedule } from 'src/utils/tripUtils'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentTrip } from 'src/feature/driver/driver.slice'
import { selectDriverRoute } from 'src/feature/driver/driver.slice'
import { selectListTicket } from 'src/feature/driver/driver.slice'
import driverThunk from 'src/feature/driver/driver.service'
import { useState, useEffect, useRef } from 'react'
import {
    CCard,
    CRow,
    CCardSubtitle,
    CCardBody,
    CFormInput,
    CCol,
    CSpinner,
    CModal,
    CModalHeader,
    CModalBody,
} from '@coreui/react'
import { Tab, TabPanel, Tabs, TabList } from 'react-tabs'
import Ticket from './Ticket'
import { convertToDisplayDate } from 'src/utils/convertUtils'
import { getTripStartStation, getTripEndStation } from 'src/utils/tripUtils'
import { selectCurrentSchedule, selectCurrentTime } from 'src/feature/driver/driver.slice'
import seat_paid from 'src/assets/items/seat_paid.svg'
import seat_empty from 'src/assets/items/seat_empty.svg'
import seat_unpaid from 'src/assets/items/seat_unpaid.svg'
import seat_checkedin from 'src/assets/items/seat_checkedin.svg'
import { QrReader } from 'react-qr-reader'
import MediaQuery from 'react-responsive'
import CIcon from '@coreui/icons-react'
import { cilQrCode } from '@coreui/icons'
const DetailTrip = () => {
    const schedule = useSelector(selectCurrentSchedule)
    const currentTrip = useSelector(selectCurrentTrip)
    const driverRoute = useSelector(selectDriverRoute)
    const seatMap = driverRoute ? driverRoute.busType.seatMap : null
    const [activeSeat, setActiveSeat] = useState(0)
    const dispatch = useDispatch()
    const listTicket = useSelector(selectListTicket)
    const [loading, setLoading] = useState(false)
    const [showScan, setShowScan] = useState(false)
    const qrReaderRef = useRef(null)
    const ticketMap = useRef(null)
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
    const updateListTicket = async () => {
        await dispatch(driverThunk.getScheduleInfor(schedule.id))
            .unwrap()
            .then(() => {})
            .catch(() => {})
        window.location.reload()
        setTimeout(
            () => ticketMap.current.scrollIntoView({ behavior: 'smooth', block: 'center' }),
            1000,
        )
    }
    const [scanResult, setScanResult] = useState('')
    const [errorScan, setErrorScan] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [delayScan, setDelayScan] = useState(400)
    const preQRValue = useRef('')
    // Hàm xử lý khi quét thành công
    const handleScan = async (data) => {
        if (data?.text !== '' && data?.text !== preQRValue.current) {
            preQRValue.current = data.text
            //Check if ticket id valid
            const ticket = schedule.tickets.filter((tk) => tk.id == data.text)
            if (ticket.length === 0) {
                setErrorScan('Vé không tồn tại hoặc không thuộc chuyến này')
                return
            } else {
                if (ticket[0].checkedIn === true) {
                    setErrorScan('Vé đã check in rồi')
                    return
                } else {
                    await dispatch(driverThunk.checkInTicket(data.text))
                        .unwrap()
                        .then(async () => {
                            setSuccessMessage('Check in thành công vé ' + ticket[0].seat)
                            setErrorScan('')
                            setScanResult('')
                            setDelayScan(false)
                            await updateListTicket()
                            setTimeout(() => setShowScan(false), 1000)
                        })
                        .catch((error) => {
                            setErrorScan(error.toString())
                        })
                }
            }
        }
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
    useEffect(() => {
        if (showScan === false) {
            setErrorScan('')
            setSuccessMessage('')
        }
    }, [showScan])
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
            <CCard ref={ticketMap}>
                {seatMap && !loading && (
                    <CRow className="justify-content-center py-2">
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
                                                                sm={2}
                                                                md={getColWidth()}
                                                                key={seat.name}
                                                                className="d-flex justify-content-center"
                                                                style={{ width: 'fit-content' }}
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
                                                            sm={2}
                                                            md={getColWidth()}
                                                            key={`${floorNumber}-${rowNumber}-${colNumber}`}
                                                            style={{ width: 'fit-content' }}
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
                        <MediaQuery maxWidth={878}>
                            <div className="d-flex justify-content-center my-3">
                                <button
                                    onClick={() => setTimeout(() => setShowScan(!showScan), 1000)}
                                    className="p-2 d-flex align-items-center gap-1 rounded-2"
                                >
                                    <CIcon icon={cilQrCode}></CIcon>
                                    <b>Quét mã vé</b>
                                </button>
                                {showScan && (
                                    <>
                                        <div
                                            className={`itemContainer ${!showScan ? 'hidden' : ''}`}
                                        >
                                            <i>
                                                <b>Quét mã QR trên vé</b>
                                            </i>
                                            <QrReader
                                                onResult={async (result, error) => {
                                                    if (!!result) {
                                                        await handleScan(result)
                                                    }
                                                }}
                                                style={{ width: '100%' }}
                                            />
                                            <i style={{ color: 'red' }}>
                                                {errorScan !== '' ? errorScan : ''}
                                            </i>
                                            <i style={{ color: 'green' }}>
                                                {successMessage !== '' ? successMessage : ''}
                                            </i>
                                            <br></br>
                                            <div style={{ textAlign: 'right' }}>
                                                <CButton
                                                    onClick={() => setShowScan(false)}
                                                    variant="outline"
                                                    color="primary"
                                                >
                                                    Đóng
                                                </CButton>
                                            </div>
                                        </div>
                                        <div className={`mask ${!showScan ? 'hidden' : ''}`} />
                                    </>
                                )}
                            </div>
                        </MediaQuery>
                        <MediaQuery maxWidth={878}>
                            <div className="py-2 border-top w-75 mt-3">
                                <b>Chú thích</b>
                                <CRow>
                                    <CCol className="d-flex align-items-center gap-1">
                                        <img src={seat_checkedin} alt="seat_checkedin" />
                                        Đã lên xe
                                    </CCol>
                                    <CCol className="d-flex align-items-center gap-1">
                                        <img src={seat_paid} alt="seat_paid" />
                                        Đã thanh toán
                                    </CCol>
                                    <CCol className="d-flex align-items-center gap-1">
                                        <img src={seat_unpaid} alt="seat_unpaid" />
                                        Chưa thanh toán
                                    </CCol>
                                    <CCol className="d-flex align-items-center gap-1">
                                        <img src={seat_empty} alt="seat_empty" />
                                        Ghế trống
                                    </CCol>
                                </CRow>
                            </div>
                        </MediaQuery>
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
