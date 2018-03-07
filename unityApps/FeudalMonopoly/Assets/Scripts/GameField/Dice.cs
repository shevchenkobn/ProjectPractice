using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Dice : MonoBehaviour
{
    public static event System.Action<int> DiceRolled = delegate { };

    private Rigidbody rigidbody;
    private Transform transform;

    private bool isLanded = false;
    private bool isThrown = false;

    private Vector3 initPosition;
    private int diceValue;

    private DiceSide[] diceSides = new DiceSide[6];

    private void Awake()
    {     
        rigidbody = GetComponent<Rigidbody>();
        transform = GetComponent<Transform>();
    }

    private void Start()
    {
        foreach (Transform child in transform)
        {
            DiceSide side = child.GetComponent<DiceSide>();
            diceSides[side.SideValue - 1] = side;
        }

        initPosition = transform.position;
        rigidbody.useGravity = false;
    }

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space)) // TODO: make UI button to roll the dice
        {
            RollDice();
        }

        if (rigidbody.IsSleeping() && !isLanded && isThrown)
        {
            OnLanded();
        }
        else if (rigidbody.IsSleeping() && isLanded && diceValue == 0)
        {
            Debug.Log("Error in dice rolling... Roll again!");
            RollAgain();
        }
    }

    private void OnLanded()
    {     
        isLanded = true;

        rigidbody.useGravity = false;
        rigidbody.isKinematic = true;

        CheckSideValue();
    }

    private void RollDice()
    {
        if (!isThrown && !isLanded)
        {
            ThrowDice();
        }
        else if (isThrown && isLanded)
        {
            ResetDice();
        }
    }

    private void ThrowDice()
    {
        isThrown = true;
        rigidbody.useGravity = true;
        rigidbody.AddTorque(Random.Range(0, 500), Random.Range(0, 500), Random.Range(0, 500));
    }

    private void ResetDice()
    {
        transform.position = initPosition;

        isThrown = false;
        isLanded = false;

        rigidbody.useGravity = false;
        rigidbody.isKinematic = false;
    }

    private void RollAgain()
    {
        ResetDice();
        ThrowDice();
    }

    private void CheckSideValue()
    {
        diceValue = 0;

        foreach (DiceSide side in diceSides)
        {
            if (side.IsOnGround)
            {
                diceValue = side.SideValue;
            }
        }

        if (diceValue != 0)
        {
            DiceRolled(diceValue);
        }
    }
}
