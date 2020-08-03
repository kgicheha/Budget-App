
//BUDGET CONTROLLER

  // keeps track of all the income and expense, and the percentage
var budgetController = (function(){

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
          this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
          this.percentage = -1;
    }

  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };


  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    //The forEach() method calls a function once for each element in an array, in order.
    data.allItems[type].forEach(function(cur) {
        sum += cur.value;
        data.totals[type] = sum;
    });

  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },

    budget: 0,
    percentage: -1
  };

  return{
    addItem: function(type, des, val){
        var newItem, ID;

        //create New Id
        //want ID = lastID +1
        if(data.allItems[type].length > 0) {
          ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
          ID = 0;
        }

        //Create new item based on 'inc' or 'exp' type
        if (type === 'exp') {
            newItem = new Expense(ID, des, val);
        } else if (type === 'inc') {
            newItem = new Income(ID, des, val);
        }

        //Push it into the data structure
        data.allItems[type].push(newItem);

        //Return the new element
        return newItem;
    },


    deleteItem: function(type, id) {
      var ids, index;


      // id = 6
      //ids =[1 2 4 6 8]
      //index=3

      ids = data.allItems[type].map(function(current){
        return current.id;

      });

      index = ids.indexOf(id);
      if (index !== -1) {
        //splice removes elements
        data.allItems[type].splice(index, 1);
      }

    },

      calculateBudget: function() {

          //Calculate total expense and income
          calculateTotal('exp');
          calculateTotal('inc');

          //Calcute the budget. Total income - Total Expense
          data.budget = data.totals.inc - data.totals.exp;

          //Calcute percentage of total expense. Use an if statement so you can only calc if income is more that 1
          if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
          } else {
            data.percentage = -1;
          }
      },

      calculatePercentages: function(){

        data.allItems.exp.forEach(function(cur) {
            cur.calcPercentage(data.totals.inc);
        });
      },

      getPercentages: function(){
        var allPerc = data.allItems.exp.map(function(cur){
          return cur.getPercentage();
        });
        return allPerc;
      },

      getBudget: function(){
        return{
          budget: data.budget,
          totalInc: data.totals.inc,
          totalExp: data.totals.exp,
          percentage: data.percentage
        }
      },

    testing: function() {
      console.log(data);
    }
  };



}) ();



//UI CONTROLLER
var UIController = (function(){

  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel:'.item__percentage',
    dateLabel: '.budget__title--month'

  };

  var formatNumber = function(num, type) {
     var numSplit, int, dec;
   /*+ or - before formatNumber,
   exactly 2 decimal points,
   comma sepaating the thousands*/
   num = Math.abs(num);
   num = num.toFixed(2); //put 2 decimals

   numSplit = num.split('.');

   int = numSplit[0];

     if (int.length > 3) {
       int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);  //if input is 23100, then output will be 23,100
     }

   dec = numSplit[1];

     type ==='exp' ? sign = '-': sign = '+';

     return (type ==='exp' ? '-': '+') + ' ' + int + '.' + dec;

  };

  var nodeListForEach = function(list, callback){
     for (var i = 0; i < list.length; i++) {
       callback(list[i], i);
     }

  };

  return {
    getInput: function(){
      return {
          type: document.querySelector(DOMstrings.inputType).value,  // will be either income or expense
          description: document.querySelector(DOMstrings.inputDescription).value,
          value: parseFloat(document.querySelector(DOMstrings.inputValue).value)  //use parseFloat to change value from string to number

      };
    },

    addListItem: function(obj, type) {
           var html, newHtml, element;
           // Create HTML string with placeholder text

           if (type === 'inc') {
               element = DOMstrings.incomeContainer;

               html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           } else if (type === 'exp') {
               element = DOMstrings.expensesContainer;

               html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           }

           // Replace the placeholder text with some actual data
           newHtml = html.replace('%id%', obj.id);
           newHtml = newHtml.replace('%description%', obj.description);
           newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

           // Insert the HTML into the DOM
           //'beforeend' feature adds the item to the bottom of the list
           document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
       },

    deleteListItem: function(selectorID) {

      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);

    },

       clearFields: function() {
         var fields, fieldsArr;
         //use to clear the data
         fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

         fieldsArr = Array.prototype.slice.call(fields);

         fieldsArr.forEach(function(current, index, array) {
           current.value = "";
         });

         fieldsArr[0].focus();

       },

       displayBudget: function(obj){
         var type;

         obj.budget > 0 ? type = 'inc' : type = 'exp';

         document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
         document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
         document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

         //if percentage is less than 0
         if (obj.percentage > 0 ) {
           document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
         } else {
           document.querySelector(DOMstrings.percentageLabel).textContent = '---';
         }

       },

       displayPercentages: function(percentages){

         var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

         nodeListForEach(fields, function(current, index){

              if (percentages[index] > 0) {
                current.textContent = percentages[index] + '%';
              } else {
                current.textContent = '---';
              }

         });


       },

       displayMonth: function() {
         var now, year, month, months;

         now = new Date();

         months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
         month = now.getMonth();

         year = now.getFullYear();
         document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

       },


       changedType: function() {
         //changes the color of the fields to red once the negative sign is selected
         var fields = document.querySelectorAll(
           DOMstrings.inputType + ',' +
           DOMstrings.inputDescription + ',' +
           DOMstrings.inputValue);

         nodeListForEach(fields, function(cur){

           cur.classList.toggle('red-focus');

         });
         //changes the check to red once the negative sign is selected
         document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
       },

       getDOMstrings: function() {
         return  DOMstrings;
    }

  };

})();




//GLOBAL APP CONTROLLER
 var controller = (function(budgetCtrl, UICtrl){
   //connects the budgetConroller and UIController modules
  //way to keep the budgetConroller and UIController modules separate

    var setupEventListeners = function(){

      var DOM = UICtrl.getDOMstrings();

      document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

      document.addEventListener('keypress', function(event) {

        if (event.keyCode === 13 || event.which === 13) {
          ctrlAddItem();
        }
      });

      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

      document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };


  var updateBudget = function() {

        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
  };

  var updatePercentages = function(){
    //1. Calculate Percentages
        budgetCtrl.calculatePercentages();

    //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

    //3. Update the UI with the new Percentages
        UICtrl.displayPercentages(percentages);

  };

  var ctrlAddItem = function() {
    var input, newItem;

    // 1. Get the fieLd input data
    var input = UICtrl.getInput();

    //create an if statement to make sure that data is only stored when the data thats been typed in
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add the item to the budget CONTROLLER
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      //4. Clear the fields
      UICtrl.clearFields();

      //5. Calculate and update budget
      updateBudget();


      //6. Calcute and update the Percentages
      updatePercentages();

    }

  };

var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    //traverse the DOM using parentNode
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    //split function divides the string into multiple strings.
    //parseInt returns an integer
    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1. delete item from the data structure
      budgetCtrl.deleteItem(type, ID);

      //2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);

      //3. Update and show the new budget
      updateBudget();

      //4. Calcute and update the Percentages
      updatePercentages();

    }
};


  return {
    init: function () {
      console.log('Application has started.');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  }

})(budgetController, UIController);

controller.init();
