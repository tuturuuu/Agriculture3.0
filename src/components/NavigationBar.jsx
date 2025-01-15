export default function NavigationBar() {
    return (
        <nav className="d-flex justify-content-between p-5">
            <div className="d-flex jusify-content-between align-items-center gap-3">
                <a href="/" className="pb-3">
                    <img src="src\assets\svg\logo.svg" alt="" />
                </a>
                <a href="/" className="text-decoration-none link-dark fw-bolder fs-4">Agriculture 3.0</a> 
                <span>|</span>
                <a href="/" className="text-decoration-none link-dark fw-semibold fs-5 nav-link">Home</a>
                <a href="/Stats" className="text-decoration-none link-dark fw-semibold fs-5 nav-link">Stats</a>
                <a href="#" className="text-decoration-none link-dark fw-semibold fs-5 nav-link">Create</a>
                <a href="/about" className="text-decoration-none link-dark fw-semibold fs-5 nav-link">About</a>
            </div>

            <div className="d-flex gap-4 align-items-center">
                <a href="#" className="nav-link">
                   <img src="src\assets\svg\shopping_cart.svg" alt="" width={25} height={25}/>
                </a>
                <a href="#" className="nav-link">
                   <img src="src\assets\svg\user.svg" alt="" width={25} height={25}/>
                </a>
                <button type="button" className="btn btn-dark p-2 ps-4 pe-4 fw-bolder fs-6">Login</button>
            </div>
        </nav>
    )
}