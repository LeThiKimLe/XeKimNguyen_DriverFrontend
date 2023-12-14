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

const BusScheduleHistory = ({ listSchedule }) => {
    const sortTime = (a, b) => {
        const timeA = new Date(a.departDate + 'T' + a.departTime)
        const timeB = new Date(b.departDate + 'T' + b.departTime)
        return timeA.getTime() - timeB.getTime()
    }
    return (
        <CTable>
            <CTableHead>
                <CTableRow>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
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
                {listSchedule
                    .sort((a, b) => sortTime(a, b))
                    .map((schedule, index) => (
                        <CTableRow key={index}>
                            <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
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
                                {schedule.driverUser ? schedule.driverUser.name : 'Đang cập nhật'}
                            </CTableDataCell>
                        </CTableRow>
                    ))}
            </CTableBody>
        </CTable>
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
        if (bus) {
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
    }, [bus])
    console.log(listTrip)
    return (
        <>
            <CToaster ref={toaster} push={toast} placement="top-end" />
            {bus && busState && (
                <CModal
                    className="mb-2"
                    size="lg"
                    alignment="center"
                    backdrop="static"
                    visible={visible}
                    onClose={() => setVisible(false)}
                >
                    <CModalHeader>
                        <b>{bus.licensePlate}</b>
                    </CModalHeader>
                    <CModalBody className="tabStyle">
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
