using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum GameStatus { Active, Pause, GameOver }

public class GameManager : MonoBehaviour
{
    public GameStatus Status { get; private set; }

    public static GameManager Instance { get; private set; }

    public Player CurrentPlayer
    {
        get
        {
            return players[currentPlayerIndex];
        }
    }

    private const int PLAYER_AMOUNT = 4;

    private Player[] players = new Player[PLAYER_AMOUNT];
    private int currentPlayerIndex = 0;

    /// <summary>
    /// Makes sure that Instance references only to one object in the scene
    /// </summary>
    void Awake()
    {
        if (!Instance)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void OnEnable()
    {
        Dice.DiceRolled += OnDiceRolled;
    }

    private void OnDisable()
    {
        Dice.DiceRolled -= OnDiceRolled;
    }

    private void OnDiceRolled(int steps)
    {
        CurrentPlayer.Move(steps);
    }

    /// <summary>
    /// Increments currentPlayerIndex and calculates index of next player
    /// </summary>
    public void NextTurn()
    {
        currentPlayerIndex++;
        currentPlayerIndex %= PLAYER_AMOUNT;
    }

    public void Registrate(Player player)
    {
        players[player.Id] = player;
    }
}
