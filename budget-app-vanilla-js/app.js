// BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.procentage = -1;
  };

  Expense.prototype.calcPercentage = function (incTotal) {
    if (incTotal > 0) {
      this.procentage = Math.round((this.value / incTotal) * 100);
    } else {
      this.procentage = -1;
    }
  };

  Expense.prototype.getPrecentage = function () {
    return this.procentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    procentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;
      // stworzenie nowego id które jestwartoscia id ostatniego elementu w tablicy zwiekszona o 1
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Stworzenie nowego obiektu w zaleznosci od typu
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      //dodanie do obiektu z wszystkimi wydatkami i przychodami
      data.allItems[type].push(newItem);
      // zwrocenie nowego obiektu by byl dostepny z zewnatrz
      return newItem;
    },

    deleteItem: function (type, ID) {
      var ids, index;

      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(ID);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      //obliczenie sumy dla exp i inc
      calculateTotal('exp');
      calculateTotal('inc');
      //obliczenie budzetu czyli exp - inc
      data.budget = data.totals.inc - data.totals.exp;
      //obliczenie procentowe inc w stosunku do exp
      if (data.totals.inc > 0) {
        data.procentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.procentage = -1;
      }
    },

    calculatePercentage: function () {
      /*
            inc=100
            a=20
            b=30

            a_proc = 20 / 100 = 0.2
            b_proc = 30/100 = 0.3
            
            */
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPrecentage: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPrecentage();
      });
      return allPerc;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        procentage: data.procentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

//UI CONTROLLER
var UIController = (function () {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    button: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    procentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expPercentageLabel: '.item__percentage',
    dataLabel: '.budget__title--month',
  };

  formatNumber = function (num, type) {
    var numSplit, int, dec;
    /*
        + lub - przed liczba
        dwa miejsca po przecinku
        przecinek pomiedzy tys
        2310.802 -> +2,310.80
        */
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    return (type == 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  //some code
  return {
    getinput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // wynikiem bedzie inc lub exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },
    addListItem: function (type, obj) {
      var html, newHtml, element;
      // stworzenie stringa z tekstem html który tworzy miejsce dla zmiennych
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //Podmiena pustych miejsc z up na faktyczne zmienne
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      // Wstawienie html do DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    displayPercentage: function (procentages) {
      var fields = document.querySelectorAll(DOMstrings.expPercentageLabel);

      nodeListForEach(fields, function (current, index) {
        if (procentages[index] > 0) {
          current.textContent = procentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function () {
      var now, year, month, months;
      now = new Date();
      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      month = now.getMonth();
      year = now.getFullYear();

      document.querySelector(DOMstrings.dataLabel).textContent =
        months[month] + ' ' + year;
    },

    getDOMstring: function () {
      return DOMstrings;
    },

    changeType: function (type) {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          ',' +
          DOMstrings.inputDescription +
          ',' +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.button).classList.toggle('red');
    },

    displayBudget: function (obj) {
      var type;
      obj.budget < 0 ? (type = 'exp') : (type = 'inc');

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        'inc'
      );
      document.querySelector(DOMstrings.expenseLabel).textContent =
        formatNumber(obj.totalExp, 'exp');

      if (obj.procentage > 0) {
        document.querySelector(DOMstrings.procentageLabel).textContent =
          obj.procentage + '%';
      } else {
        document.querySelector(DOMstrings.procentageLabel).textContent = '---';
      }
    },

    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ', ' + DOMstrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current, index, array) {
        current.value = '';
      });
      fieldsArr[0].focus();
    },
  };
})();

// GLOBAL APP CONTREOLLER
var controler = (function (budgetCtrl, UICtrl) {
  var setupEventListners = function () {
    var DOM = UICtrl.getDOMstring();

    document.querySelector(DOM.button).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changeType);
  };

  var updateListProcentages = function () {
    // liczenie procentów
    budgetCtrl.calculatePercentage();
    //zmienna z wyniki
    var procentage = budgetCtrl.getPrecentage();
    //wyświetlenie procentów
    UICtrl.displayPercentage(procentage);
  };

  var updateBudget = function () {
    //calculate budget
    budgetCtrl.calculateBudget();
    // return the budget
    var budget = budgetCtrl.getBudget();
    //display the budget on the ui
    UICtrl.displayBudget(budget);
  };
  var ctrlAddItem = function () {
    var input, newItem;

    // get input data
    input = UICtrl.getinput();
    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      //add the item to budgetcontroler
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      //add the iteam to ui
      UICtrl.addListItem(input.type, newItem);
      // czyszczenie pola tekstowego
      UICtrl.clearFields();

      //calc and update budget
      updateBudget();

      //calc and updating procent for each exp list element

      updateListProcentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //USUNIECIE Z BAZY DANYCH
      budgetCtrl.deleteItem(type, ID);
      //USUNIECIE Z UI
      UICtrl.deleteListItem(itemID);
      //ODSWIERZENIE I WYSIETLENIE POPRAWNEGO BUDZETU
      updateBudget();
    }
  };

  return {
    init: function () {
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        procentage: -1,
      });
      setupEventListners();
    },
  };
})(budgetController, UIController);

controler.init();
