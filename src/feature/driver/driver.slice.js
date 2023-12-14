import { createSlice } from '@reduxjs/toolkit'
import driverThunk from './driver.service'

const initialState = {
    listSchedule: [],
    listTrip: [],
    driverRoute: null,
    currentTrip: null,
    currentScheduleTicketList: [],
    currentSchedule: null,
    currentTripTimeProp: '',
    currentBus: null,
}

const driverSlice = createSlice({
    name: 'driver',
    initialState,
    reducers: {
        setDriverRoute: (state, action) => {
            state.driverRoute = action.payload
        },
        setCurrentTrip: (state, action) => {
            state.currentTrip = action.payload
        },
        setCurrentSchedule: (state, action) => {
            state.currentSchedule = action.payload
        },
        setCurrentTripTimeProps: (state, action) => {
            state.currentTripTimeProp = action.payload
        },
        setCurrentBus: (state, action) => {
            state.currentBus = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(driverThunk.getDriverTrip.fulfilled, (state, action) => {
                state.listTrip = action.payload
            })
            .addCase(driverThunk.getDriverTrip.rejected, (state) => {
                state.listTrip = []
            })
            .addCase(driverThunk.getDriverSchedules.fulfilled, (state, action) => {
                state.listSchedule = action.payload
            })
            .addCase(driverThunk.getDriverSchedules.rejected, (state) => {
                state.listSchedule = []
            })
            .addCase(driverThunk.getScheduleInfor.fulfilled, (state, action) => {
                state.currentScheduleTicketList = action.payload
            })
            .addCase(driverThunk.getScheduleInfor.rejected, (state) => {
                state.currentScheduleTicketList = []
            })
    },
})

export const selectDriverTrip = (state) => state.driver.listTrip
export const selectDriverSchedules = (state) => state.driver.listSchedule
export const selectDriverRoute = (state) => state.driver.driverRoute
export const selectCurrentTrip = (state) => state.driver.currentTrip
export const selectListTicket = (state) => state.driver.currentScheduleTicketList
export const selectCurrentSchedule = (state) => state.driver.currentSchedule
export const selectCurrentTime = (state) => state.driver.currentTripTimeProp
export const selectCurrentBus = (state) => state.driver.currentBus
export const driverAction = driverSlice.actions
export default driverSlice.reducer
