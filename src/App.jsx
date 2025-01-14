import NavigationBar from "./components/NavigationBar"

function App() {

  return (
    <>
      <NavigationBar />

      {/* image canvas? here */}
      <div className="position-relative">
        <img src="src\assets\png\background.png" alt="" width="100%" height="575px" style={{objectFit: 'cover'}}/>

        <span style={{top: '50%', left: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', textAlign: 'center', fontSize: '3rem'}} className="fw-semibold" >
          Algriculture Blockchain Trading Platform
            <button style={{width:'55%', marginTop: '3%', borderRadius:'30px'}} className="btn btn-lg btn-dark fs-4 fw-semibold 
            " type="button">Get started</button>
        </span>
      </div>

      {/* Popular */}
      <section className="p-5">
        <h1 className="fs-3 fw-bold">Popular 🔥</h1>
      </section>

    </>
  )
}

export default App
