﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class Dice : MonoBehaviour
{
    public static event System.Action<int> DiceRolled = delegate { };

    private Rigidbody rigidbody;
    private Transform transform;

    private bool isLanded = false;
    private bool isThrown = false;

    private Vector3 initPosition;
    private Quaternion initialRotation;
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

        initialRotation = transform.rotation;
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

    /// <summary>
    /// Sets rigidbody properties and checks grounded side
    /// </summary>
    private void OnLanded()
    {     
        isLanded = true;

        rigidbody.useGravity = false;
        rigidbody.isKinematic = true;

        CheckSideValue();
    }

    /// <summary>
    /// Checks if dice wasn't thrown
    /// If it was, resets its position
    /// Otherwise throws the dice
    /// </summary>
    private void RollDice()
    {
        int randomnNumber = Random.Range(1, 7);

        if (!isThrown && !isLanded)
        {
            ThrowDice(randomnNumber);
        }
        else if (isThrown && isLanded)
        {
            ResetDice();
        }
    }

    /// <summary>
    /// Throws dice with rando values
    /// </summary>
    private void ThrowDice(int number)
    {
        isThrown = true;
        rigidbody.useGravity = true;

        int x = Random.Range(0, 500);
        int y = Random.Range(0, 500);
        int z = Random.Range(0, 500);

        Debug.Log("x: " + x + " y: " + y + " z: " + z);
        rigidbody.AddTorque(x, y, z);
    }


    /// <summary>
    /// Get dice back to its initial position and sets rigidbody properties
    /// </summary>
    private void ResetDice()
    {
        transform.rotation = initialRotation;
        transform.position = initPosition;

        isThrown = false;
        isLanded = false;

        rigidbody.useGravity = false;
        rigidbody.isKinematic = false;
    }

    /// <summary>
    /// Rolls dice again that is resets its initial position and throws
    /// </summary>
    private void RollAgain()
    {
        ResetDice();

        int randomnNumber = Random.Range(1, 7);

        ThrowDice(randomnNumber);
    }

    /// <summary>
    /// Checks grounded side and its value
    /// </summary>
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