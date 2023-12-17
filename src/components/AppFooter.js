import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
    return (
        <CFooter>
            <div>
                <a href="#" target="_blank" rel="noopener noreferrer">
                    Xe Kim Nguyên
                </a>
                <span className="ms-1">&copy; @2023</span>
            </div>
            <div className="ms-auto">
                <span className="me-1">Powered by</span>
                Lê Thị Kim Lệ - Nguyễn Thị Cẩm Nguyên
            </div>
        </CFooter>
    )
}

export default React.memo(AppFooter)
