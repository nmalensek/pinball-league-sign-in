
window.addEventListener('load', function() {
    // if (storageAvailable('localStorage')) {
    //     storageFuncs.load()
    //     storageFuncs.enableSave();
    // }
    playerManager.init();
});

pageVariables = function() {
    elementId = {
        newPlayerTextbox: 'newPlayerTextbox',
        addPlayerButton: 'addPlayerButton',
        savePlayersButton: 'saveAllPlayersButton',
        playerListRoot: 'attendingPlayers',
        groupPlayersButton: 'groupPlayersButton',
        groupsDiv: 'groupsDiv',
    };

    classNames = {
        deletePlayer: 'delete-player',
        playerInfo: 'player-info',
        groupListing: 'group-listing'
    };

    custAttributes = {
        playerId: 'data-PlayerId',
        hasClickHandler: 'data-hasClickHandler'
    }

    return {
        elementId,
        classNames,
        custAttributes
    };
}();

playerManager = function() {
    //manage players:
    //split into groups

    function init() {
        let playerList = document.getElementById(pageVariables.elementId.playerListRoot);
        createAddHandlers();
        createDeleteHandler(playerList);
        addGroupHandler(playerList.children);
    }
    
    function createAddHandlers() {
        let newText = document.getElementById(pageVariables.elementId.newPlayerTextbox);
        newText.addEventListener('keydown',
            function(event) { 
                if (event.key === 'Enter' && newText.value.length > 0) {
                    addPlayer();
            }
        })
        document.getElementById(pageVariables.elementId.addPlayerButton).addEventListener('click', addPlayer);
    }

    function createDeleteHandler(handlingElem) {
        handlingElem.addEventListener('click', function(e) {    
            let elClass = e.target.getAttribute('class');
            if (e.target !== e.currentTarget && elClass !== null 
                && elClass.indexOf(pageVariables.classNames.deletePlayer) > -1) {
                    handlingElem.removeChild(e.target.parentElement);
                    pageManipulation.checkIfGroupingPossible();
            }
            e.stopPropagation();
        });
    }

    function addPlayer() {
        let textbox = document.getElementById(pageVariables.elementId.newPlayerTextbox);
        let newId = globalData.addPlayer(textbox.value);
        pageManipulation.addNewSignIn(newId, textbox.value);
        textbox.value = '';
    }

    function addGroupHandler(playerSource) {
        let groupButton = document.getElementById(pageVariables.elementId.groupPlayersButton);
        
        groupButton.addEventListener('click', function() {
            let players = groupingFuncs.getPlayersFromUi(playerSource);
            groupingFuncs.shuffleArray(players);
            let finalGroups = groupingFuncs.groupPlayers(players);
            pageManipulation.displayGroups(finalGroups);
        });
    }

    return {
        init: init
    };
}();

groupingFuncs = function() {

    function getPlayersFromUi(playerSource) {
        let playerElems;
        let players = [];
        for (var i = 0; i < playerSource.length; i++) {
            playerElems = playerSource[i].getElementsByClassName(pageVariables.classNames.playerInfo);
            for (var j = 0; j < playerElems.length; j++) {
                players.push(playerElems[j].textContent);
            }
        }
        return players;
    }

    function shuffleArray(ogArray) {
        for (var i = ogArray.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = ogArray[i];
            ogArray[i] = ogArray[j];
            ogArray[j] = temp;
        }
    }

    function groupPlayers(playerArray) {
        if (playerArray.length < 3 || playerArray.length === 5) { return null; }
        let groups = [];
        let groupSize = 4;
        let smallGroupSize = 3;

        while ((playerArray.length - groupCounter.getCounter()) % groupSize !== 0) {
            groups.push(createGroup(smallGroupSize, playerArray));
        }

        while (groupCounter.getCounter() < playerArray.length - 1) {
            groups.push(createGroup(groupSize, playerArray));
        }

        groupCounter.resetCounter();

        return groups;
    }

    function createGroup(numPlayers, source) {
        let newGroup = [];
        for (var i = 0; i < numPlayers; i++) {
            newGroup.push(source[groupCounter.getCounter()]);
            groupCounter.incrementCounter();
        }

        return newGroup
    }

    groupCounter = function() {
        let counter = 0;

        function getCounter() {
            return counter;
        }

        function incrementCounter() {
            return counter++;
        }

        function resetCounter() {
            counter = 0;
        }

        return {
            getCounter: getCounter,
            incrementCounter: incrementCounter,
            resetCounter: resetCounter
        };
    }();

    return {
        getPlayersFromUi: getPlayersFromUi,
        shuffleArray: shuffleArray,
        groupPlayers: groupPlayers
    };
}();


pageManipulation = function() {
    let playerListRoot = document.getElementById(pageVariables.elementId.playerListRoot);
    
    function addNewSignIn(id, name) {
        let newLi = document.createElement('li');

        let newPlayer = document.createElement('span');
        newPlayer.id = id + '_' + name;
        newPlayer.setAttribute(pageVariables.custAttributes.playerId, id);
        newPlayer.textContent = name;
        newPlayer.setAttribute('class', pageVariables.classNames.playerInfo);
        
        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('class', pageVariables.classNames.deletePlayer);
        
        newLi.appendChild(newPlayer);
        newLi.appendChild(deleteButton);
        playerListRoot.appendChild(newLi);
        playerListRoot.addDeleteHandler

        checkIfGroupingPossible();
    }

    function checkIfGroupingPossible() {
        if (playerListRoot.children.length >= 3 && playerListRoot.children.length !== 5) {
            document.getElementById(pageVariables.elementId.groupPlayersButton).removeAttribute('disabled');    
        } else {
            document.getElementById(pageVariables.elementId.groupPlayersButton).setAttribute('disabled', '');
        }
    }

    function displayGroups(groupedPlayers) {
        let groupDiv = document.getElementById(pageVariables.elementId.groupsDiv)
        groupDiv.style.display = 'block';
        if (groupDiv.children.length > 1) {
            clearOldGroups(groupDiv);
        }

        for (var i = 0; i < groupedPlayers.length; i++) {
            let newDiv = document.createElement('div');
            let groupSpan = document.createElement('span');
            groupSpan.setAttribute('class', pageVariables.classNames.groupListing);
            groupSpan.textContent = `Group ${i + 1}: ${groupedPlayers[i].join(', ')}`;
            newDiv.appendChild(groupSpan);
            groupDiv.appendChild(newDiv);
        }
    }

    function clearOldGroups(target) {
        while (target.children.length > 1) {
            target.removeChild(target.lastElementChild);
        }
    }

    return {
        addNewSignIn: addNewSignIn,
        checkIfGroupingPossible: checkIfGroupingPossible,
        displayGroups: displayGroups
    };
}();

globalData = function() {
    var idCounter = 0;

    function getCurrentId() {
        return idCounter;
    }

    function getNextId() {
       return ++idCounter;
    }

    function addPlayer(name) {
        // playerMap[getNextId()] = name;
        return getNextId();
    }

    function setNextId(savedMap) {
        // set counter to max value from loaded map   
    }

    return {
        addPlayer: addPlayer,
        setNextId: setNextId
    };
}();

function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

storageFuncs = function() {
    function loadSavedPlayers() {
        // if localStorage.length > 0, then make roster div visible and add all values to player map.
    }

    function enableSaveButton() {
        var saveButton = document.getElementById(pageVariables.elementId.savePlayersButton)
        saveButton.addEventListener(
            'click', function() { savePlayers(); }
        );
        saveButton.style.display = 'block';
    }

    function savePlayers() {

    }

    function deletePlayers() {

    }

    return {
        load: loadSavedPlayers,
        enableSave: enableSaveButton
    };
}();

function testGrouping() {
    function makeArray(num) {
        let arr = [];
        for (var i = 0; i < num; i++) {
            arr.push(i);
        }
        return arr;
    }

    function checkArray(arr, expectedLengths) {
        if (arr === null && expectedLengths === null) { return true; }
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].length !== expectedLengths[i]) {
                return false;
            }
        }
        return true;
    }

    testArr = groupingFuncs.groupPlayers(makeArray(20));
    testArr2 = groupingFuncs.groupPlayers(makeArray(5));
    testArr3 = groupingFuncs.groupPlayers(makeArray(4));
    test4 = groupingFuncs.groupPlayers(makeArray(3));
    test6 = groupingFuncs.groupPlayers(makeArray(16));
    test7 = groupingFuncs.groupPlayers(makeArray(17));
    test8 = groupingFuncs.groupPlayers(makeArray(18));
    test9 = groupingFuncs.groupPlayers(makeArray(19));
    test10 = groupingFuncs.groupPlayers(makeArray(null));

    console.log(testArr.length === 5 && checkArray(testArr, [4,4,4,4,4]));
    console.log(testArr2 === null && checkArray(testArr2, null));
    console.log(testArr3.length === 1 && checkArray(testArr3, [4]));
    console.log(test4.length === 1 && checkArray(test4, [3]));
    console.log(test6.length === 4 && checkArray(test6, [4,4,4,4]));
    console.log(test7.length === 5 && checkArray(test7, [3,3,3,4,4]));
    console.log(test8.length === 5 && checkArray(test8, [3,3,4,4,4]));
    console.log(test9.length === 5 && checkArray(test9, [3,4,4,4,4]));
    console.log(test10 === null);
}