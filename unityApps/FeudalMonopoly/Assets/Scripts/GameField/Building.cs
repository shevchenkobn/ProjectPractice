using UnityEngine;

public class Building : MonoBehaviour
{
    public BuidlingInfo buidlingInfo;
    public int TapCount { get; set; }
    public float TapTime { get; set; }
    public bool IsCaptured { get; set; }
}
