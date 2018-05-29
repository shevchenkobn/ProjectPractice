using UnityEngine;

public class RoomLeaveButton : MonoBehaviour
{
    public void LeaveRoom()
    {
        //TODO: workaround
        LevelLoadHelper.LoadPreviousLevel();
    }
}
