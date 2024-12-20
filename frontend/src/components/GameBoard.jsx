import React, { useState } from 'react';

const initializeBoard = () => {
    const board = Array(8).fill(null).map(() => Array(8).fill(''));
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) board[row][col] = 'P1'; // Pionki gracza 1
        }
    }
    for (let row = 5; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) board[row][col] = 'P2'; // Pionki gracza 2
        }
    }
    return board;
};

function GameBoard() {
    const [board, setBoard] = useState(initializeBoard());
    const [selectedPiece, setSelectedPiece] = useState(null); // Przechowuje zaznaczony pionek
    const [currentPlayer, setCurrentPlayer] = useState('P1'); // Aktualny gracz

    const isValidMove = (startRow, startCol, endRow, endCol) => {
        // Sprawdź, czy pole docelowe jest puste
        if (board[endRow][endCol] !== '') return false;

        const direction = currentPlayer === 'P1' ? 1 : -1;
        const rowDiff = endRow - startRow;
        const colDiff = Math.abs(endCol - startCol);

        // Sprawdź poprawność ruchu w jednym kierunku (naprzód) i na ukos
        return rowDiff === direction && colDiff === 1;
    };

    const handleSquareClick = (row, col) => {
        if (selectedPiece) {
            // Jeśli zaznaczony pionek, spróbuj go przesunąć
            const [startRow, startCol] = selectedPiece;
            if (isValidMove(startRow, startCol, row, col)) {
                const newBoard = board.map(row => row.slice()); // Kopia tablicy
                newBoard[row][col] = currentPlayer; // Przesuń pionek
                newBoard[startRow][startCol] = ''; // Usuń pionek z poprzedniego pola
                setBoard(newBoard);
                setSelectedPiece(null); // Odznacz pionek
                setCurrentPlayer(currentPlayer === 'P1' ? 'P2' : 'P1'); // Zmień gracza
            } else {
                alert('Nieprawidłowy ruch!');
            }
        } else if (board[row][col] === currentPlayer) {
            // Jeśli kliknięto pionek należący do aktualnego gracza, zaznacz go
            setSelectedPiece([row, col]);
        }
    };

    const renderSquare = (row, col) => (
        <div
            key={`${row}-${col}`}
            onClick={() => handleSquareClick(row, col)}
            style={{
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: selectedPiece && selectedPiece[0] === row && selectedPiece[1] === col
                    ? 'yellow'
                    : (row + col) % 2 === 0
                        ? 'white'
                        : 'black',
                color: (row + col) % 2 === 0 ? 'black' : 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
            }}
        >
            {board[row][col] === 'P1' ? '⬤' : board[row][col] === 'P2' ? '◯' : ''}
        </div>
    );

    return (
        <div style={{
            width: '400px',
            height: '400px',
            display: 'grid',
            gridTemplate: 'repeat(8, 1fr) / repeat(8, 1fr)',
            border: '2px solid black',
        }}>
            {board.map((row, rowIndex) =>
                row.map((_, colIndex) => renderSquare(rowIndex, colIndex))
            )}
        </div>
    );
}

export default GameBoard;
