using UnityEngine;

public class FPSCounter : MonoBehaviour 
{	
	public int frameRange;
	public int AvarageFPS { get; private set; }
	public int HighestFPS { get; private set; }
	public int LowestFPS { get; private set; }

	private int[] fpsBuffer;
	private int fpsBufferIndex;
	
	void Update()
	{
		if (fpsBuffer == null || fpsBuffer.Length != frameRange)
		{
			InitializeBuffer();
		}

		UpdateBuffer();
		CalculateFPS();		
	}

    private void CalculateFPS()
    {
		int sum = 0;
		int low = int.MaxValue;
		int high = 0;

        for (int i = 0; i < frameRange; i++)
		{
			int fps = fpsBuffer[i];

			if (fps > high) high = fps;
            if (fps < low) low = fps;

            sum += fps;
		}

		AvarageFPS = sum / frameRange;
		HighestFPS = high;
		LowestFPS = low;
    }

    private void UpdateBuffer()
    {
        fpsBuffer[fpsBufferIndex++] = (int) (1f / Time.unscaledDeltaTime);

		if (fpsBufferIndex >= frameRange) fpsBufferIndex = 0;
    }

    private void InitializeBuffer()
	{
		if (frameRange <= 0) frameRange = 1;

		fpsBuffer = new int[frameRange];
		fpsBufferIndex = 0;
	}
}
