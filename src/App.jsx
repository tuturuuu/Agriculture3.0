import NavigationBar from "./components/NavigationBar"

function App() {

  return (
    <>
      <NavigationBar />

      {/* image canvas? here */}
      <div className="position-relative">
        <img src="src\assets\png\background.png" alt="" width="100%" />

        <h1 style={{top: '35%', left: '50%', position: 'absolute', transform: 'translate(-50%, -50%)'}} >Algriculture Blockchain Trading Platform </h1>

        <button className="position-absolute top-50 start-50 translate-middle btn btn-darkw" type="button">Hi</button>
      </div>


    </>
  )
}

export default App
