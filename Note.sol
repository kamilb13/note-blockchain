// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Notatnik {
    struct Notatka {
        address autor;
        string tresc;
        uint256 timestamp;
    }

    Notatka[] private notatki;

    event NowaNotatka(address indexed autor, string tresc, uint256 timestamp);

    function dodajNotatke(string memory _tresc) public {
        require(bytes(_tresc).length > 0, "Notatka nie moze byc pusta");
        notatki.push(Notatka(msg.sender, _tresc, block.timestamp));
        emit NowaNotatka(msg.sender, _tresc, block.timestamp);
    }

    function pobierzNotatki(uint256 start, uint256 limit) public view returns (Notatka[] memory) {
        require(start < notatki.length, "Start poza zakresem");
        uint256 koniec = start + limit;
        if (koniec > notatki.length) {
            koniec = notatki.length;
        }
        uint256 rozmiar = koniec - start;
        Notatka[] memory wynik = new Notatka[](rozmiar);
        for (uint256 i = 0; i < rozmiar; i++) {
            wynik[i] = notatki[start + i];
        }
        return wynik;
    }

    function liczbaNotatek() public view returns (uint256) {
        return notatki.length;
    }
}
