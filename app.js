(function() {
  "use strict";

  function fill(template, data) {
    Object.keys(data).forEach(function(key) {
      var placeholder = "{{" + key + "}}";
      var value = data[key];

      while (template.indexOf(placeholder) !== -1) {
        template = template.replace(placeholder, value);
      }
    });
    return template;
  }

  function fillList(template, dataArray) {
    var listString = "";

    dataArray.forEach(function(data) {
      listString += fill(template, data);
    });

    return listString;
  }

  if (window.gpwj === undefined) {
    window.gpwj = {};
  }

  gpwj.templates = {
    fill: fill,
    fillList: fillList
  };
})();

(function() {
  "use strict";

  var List = function(title, listId = null) {
    // contains the list of items
    var items = [];
    // creates a unique id for each item
    var idCounter = 0;

    // adds an item to end of the list
    this.addItem = function(item) {
      items.push({
        itemId: listId + "-" + idCounter,
        isComplete: "[ ]",
        textStyle: "listTextUnchecked",
        item: item
      });
      idCounter += 1;
    };

    // marks an item complete
    this.markComplete = function(id) {
      // find the index of item on the list
      var itemIndex = items.findIndex(function(item) {
        return item.itemId === id;
      });

      // make sure the item is on the list
      if (itemIndex !== -1) {
        var item = items[itemIndex];
        if (item.isComplete === "[ ]") {
          item.isComplete = "[X]";
          item.textStyle = "listTextChecked";
        } else {
          item.isComplete = "[ ]";
          item.textStyle = "listTextUnchecked";
        }
      }
    };

    this.deleteItem = function(id) {
      // find the index of item on the list
      var itemIndex = items.findIndex(function(item) {
        return item.itemId === id;
      });

      // make sure the item is on the list
      if (itemIndex !== -1) {
        items.splice(itemIndex, 1);
      }
    };

    // show the data of the list
    this.getData = function() {
      var data = {
        listId: listId,
        title: title,
        items: items.slice()
      };

      return data;
    };
  };

  if (window.toDoApp === undefined) {
    window.toDoApp = {};
  }

  toDoApp.List = List;
})();

(function() {
  "use strict";

  var Lists = function() {
    // contains the list of lists
    var lists = [];

    // creates a unique if for each list
    var listCounter = 0;

    // creates a new list by passing an object with the list title
    this.addList = function(listObject) {

      // makes a new list using the List constructor function
      var list = new toDoApp.List(listObject.title, listCounter);

      // if the list object has items, use the methods of a list to add it to the lists array
      if (listObject.items !== undefined) {
        listObject.items.forEach(list.addItem);
      }
      lists.push(list);
      listCounter += 1;
    };

    // deletes a list
    this.deleteList = function(listId) {

      // find the index of the list
      var listIndex = lists.findIndex(function(list) {
        return list.getData().listId === listId;
      });

      if (listIndex !== -1) {
        lists.splice(listIndex, 1);
      }
    };

    // marks an item complete on a specific list
    this.markItemCompleteOnList = function(itemId, listId) {
      // find the index of the list
      var listIndex = lists.findIndex(function(list) {
        return list.getData().listId === listId;
      });

      // make sure the list is available
      if (listIndex !== -1) {
        lists[listIndex].markComplete(itemId);
      }

      return listIndex;
    };

    // delete an item on a specific list
    this.deleteItemOnList = function(itemId, listId) {
      // find the index of the list
      var listIndex = lists.findIndex(function(list) {
        return list.getData().listId === listId;
      });

      // make sure the list is available
      if (listIndex !== -1) {
        lists[listIndex].deleteItem(itemId);
      }

      return listIndex;
    };

    // add an item on a specific list
    this.addItemOnList = function(item, listId) {
      // find the index of the list
      var listIndex = lists.findIndex(function(list) {
        return list.getData().listId === listId;
      });

      // make sure the list is available
      if (listIndex !== -1) {
        lists[listIndex].addItem(item);
      }

      return listIndex;
    };

    // return a data of the lists
    this.getData = function() {
      var data = {
        lists: lists.slice()
      };
      return data;
    };
  };

  if (window.toDoApp === undefined) {
    window.toDoApp = {};
  }

  toDoApp.Lists = Lists;
})();

(function() {
  "use strict";

  var itemScript = document.getElementById("itemTemplate");
  var itemTemplate = itemScript.innerHTML;

  function render(listData) {
    // get the data of a list
    var data = listData.getData();

    // find the correct unordered list of the specified list
    var id = "list-" + data.listId;

    // get each list of items and insert on the unordered list
    var items = data.items;
    var list = document.getElementById(id);
    list.innerHTML = gpwj.templates.fillList(itemTemplate, items);
  }

  if (window.toDoApp === undefined) {
    window.toDoApp = {};
  }

  toDoApp.listView = {
    render: render
  };
})();

(function() {
  "use strict";

  var listsDiv = document.getElementById("listsContainer");
  var listScript = document.getElementById("listTemplate");
  var listTemplate = listScript.innerHTML;

  function render(listsData) {
    // get the data of each list
    var data = listsData.getData();
    var lists = data.lists;

    listsDiv.innerHTML = "";

    // for each list, fill the HTML with the header and add item form
    // and render the list of items
    lists.forEach(function(list) {
      listsDiv.innerHTML += gpwj.templates.fill(listTemplate, list.getData());
      toDoApp.listView.render(list);
    });
  }

  if (window.toDoApp === undefined) {
    window.toDoApp = {};
  }

  toDoApp.listsView = {
    render: render
  };
})();

(function() {
  "use strict";

  var listsData;

  // render the buttons and make sure the have the attached events
  function renderButtons() {
    document.querySelectorAll(".deleteListButton").forEach(function(button) {
      button.addEventListener("click", deleteList);
    });

    listsData.getData().lists.forEach(function(list) {
      var listId = list.getData().listId;
      var buttonId = "addItemButton-" + listId;
      var inputId = "inputItem-" + listId;
      document.getElementById(buttonId).addEventListener("click", addItem);
      document.getElementById(inputId).addEventListener("keydown", function(e) {
        if (e.keyCode === 13) {
          e.preventDefault();
          document.getElementById(buttonId).click();
        }
      });
    });

    document.querySelectorAll(".markItemCompleteButton").forEach(function(button) {
      button.addEventListener("click", markComplete);
    });

    document.querySelectorAll(".deleteItemButton").forEach(function(button) {
      button.addEventListener("click", deleteItem);
    });
  }

  // render a specific list instead of the whole page
  function renderSingle(index) {
    toDoApp.listView.render(listsData.getData().lists[index]);
    renderButtons();
  }

  // render the whole page
  function renderAll() {
    toDoApp.listsView.render(listsData);
    renderButtons();
  }

  // initialize the data on the screen
  function init(data = null) {
    listsData = new toDoApp.Lists();

    if (data !== null) {
      if (data.lists !== undefined) {
        data.lists.forEach(listsData.addList);
      }
      renderAll();
    }
  }

  // add a list
  function addList(title) {
    listsData.addList({ title: title });
    renderAll();
  }

  // delete a list
  function deleteList(e) {
    e.preventDefault();

    var id = Number(e.target.getAttribute("data-id"));
    listsData.deleteList(id);

    renderAll();
  }

  // add an item
  function addItem(e) {
    e.preventDefault();

    var listId = Number(e.target.getAttribute("data-id"));
    var inputId = "inputItem-" + listId;

    var inputItemBox = document.getElementById(inputId);
    var inputItem = inputItemBox.value;

    if (inputItem !== "") {
      renderSingle(listsData.addItemOnList(inputItem, listId));
      inputItemBox.value = "";
      inputItemBox.focus();
    }
  }

  // mark an item complete
  function markComplete(e) {
    e.preventDefault();
    var itemId = e.target.getAttribute("data-id");
    var listId = Number(itemId.split("-")[0]);
    renderSingle(listsData.markItemCompleteOnList(itemId, listId));
  }

  // delete an item
  function deleteItem(e) {
    e.preventDefault();
    var itemId = e.target.getAttribute("data-id");
    var listId = Number(itemId.split("-")[0]);
    renderSingle(listsData.deleteItemOnList(itemId, listId));
  }

  window.toDo = {
    addList: addList,
    init: init
  };
})();

(function() {
  "use strict";

  // add an event to the add list form
  var addListButton = document.getElementById("addListButton");
  addListButton.addEventListener("click", addNewList);

  var inputListBox = document.getElementById("inputList");
  inputListBox.addEventListener("keydown", function(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      addListButton.click();
    }
  });

  function addNewList() {
    var inputList = inputListBox.value;

    if (inputList !== "") {
      toDo.addList(inputList);
      inputListBox.value = "";

      // TODO: change focus to the new list
      inputListBox.focus();
    }
  }
})();

toDo.init();
