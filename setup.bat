@echo off
echo Starting Hardhat blockchain...
cd dapp

call npm install
:: Start Hardhat node in a separate terminal
call npx hardhat compile
start cmd /k "npx hardhat node"

:: Wait for Hardhat to initialize
timeout /t 5 /nobreak >nul

echo Deploying smart contracts...
call npx hardhat run scripts/deploy-script.js --network localhost

cd ..
echo Starting frontend...
cd fe
call npm install
start cmd /k "npm run dev"

cd ..
echo Starting backend...
cd be
python -m venv .venv
:: Use CMD activation instead of PowerShell
call .venv\Scripts\activate.bat
call pip install -r requirements.txt
call python .\data\generate_data.py
start cmd /k "fastapi dev main.py"

echo All services started!
pause
