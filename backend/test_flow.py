import asyncio
import uuid
import httpx
import websockets
import json

async def test_full_flow():
    session_id = str(uuid.uuid4())
    print("Session ID:", session_id)
    
    # Upload file
    async with httpx.AsyncClient() as client:
        with open("/home/alpesh/Projects/AAI_Project/backend/app/main.py", "rb") as f:
            # We just need any valid file, but file upload needs CSV/Excel. Let's make a dummy CSV.
            pass

    dummy_csv = "Survived,Pclass,Sex,Age\n1,1,female,38\n0,3,male,22\n"
    with open("dummy.csv", "w") as f:
        f.write(dummy_csv)
        
    async with httpx.AsyncClient() as client:
        with open("dummy.csv", "rb") as f:
            res = await client.post("http://localhost:8000/api/upload", files={"file": ("dummy.csv", f, "text/csv")})
            print("Upload:", res.text)
            file_id = res.json()["file_id"]

    # Connect WebSocket
    uri = f"ws://localhost:8000/api/ws/{session_id}"
    async with websockets.connect(uri) as websocket:
        print("WS Connected!")
        
        # Start Analysis
        async with httpx.AsyncClient() as client:
            res = await client.post("http://localhost:8000/api/analysis/start", json={
                "file_id": file_id,
                "user_query": "plot a histogram of age",
                "session_id": session_id
            })
            print("Start:", res.text)

        # Wait for WS messages
        while True:
            msg = await websocket.recv()
            data = json.loads(msg)
            event = data.get("event")
            print(f"WS Event: {event}")
            if event == "analysis:result":
                print("Result received!")
                res_data = data["data"]
                print("Summary:", res_data.get("summary")[:50] if res_data.get("summary") else None)
                print("Visualizations:", len(res_data.get("visualizations", [])))
                break

if __name__ == "__main__":
    asyncio.run(test_full_flow())
