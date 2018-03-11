using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DiceSide : MonoBehaviour
{
    public DiceSide oppositeSide;

    public bool IsOnGround { get; private set; }    
    public int SideValue { get { return value; } }

    [SerializeField] private int value;

    /// <summary>
    /// Detectes whether side touches the ground 
    /// </summary>
    /// <param name="other">Another object to check</param>
    private void OnTriggerStay(Collider other)
    {
        if (other.CompareTag("Floor"))
        {
            IsOnGround = true;
        }
    }

    /// <summary>
    /// Detectes whether side leaves the ground 
    /// </summary>
    /// <param name="other">Another object to check</param>
    private void OnTriggerExit(Collider other)
    {
        if (other.CompareTag("Floor"))
        {
            IsOnGround = false;
        }
    }
}
