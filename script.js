// This setting will automatically update on the hour

$(document).ready(function(){
    let time= moment().format("h:mm:ss");
    let timeSplit = time.split(":"); 
    let minutesToRefresh= 59 - parseInt(timeSplit[1]); 
    let secondsToRefresh= 60- parseInt(timeSplit[2]); 
    let timeToRefresh= minutesToRefresh*60 + secondsToRefresh; 
    let secondsElapsed=0; 
    let timerUntilStartReloading= setInterval(function(){ 
        secondsElapsed++
        if (secondsElapsed === timeToRefresh){
            console.log(moment()); 
            let isReloading= confirm("It's a new hour! Would you like to reload the page?"); 
            if (isReloading) {
                window.location.reload(true);
            } else {
                alert("Automatic hourly reloading will no longer occur unless you reload the page."); 
            }
        }
    },1000);
}); 

// Names of the elements

let timeBlockContainer = $(".container"); 
let todaysDateEl= $("#currentDay"); 

//C Display to the user the current date
todaysDateEl.text(moment().format("dddd, MMMM Do")); 

// This javascript creates the time slots
let timesArr= ["9AM","10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM"]; 

for (let i=1; i<timesArr.length; i++){
    let newTimeBlockEL= $("#9AM").clone();
    newTimeBlockEL.attr("id", timesArr[i]); 
    newTimeBlockEL.children(".row").attr("style", "white-space: pre-Wrap"); 
    newTimeBlockEL.children(".row").children(".hour").text(timesArr[i]); 
    newTimeBlockEL.appendTo(".container"); 

}; 

// Local storage
let savedDayPlans;
let locationArr = []; 

function populateSavedEvents(){
    savedDayPlans= localStorage.getItem("savedDayPlans"); 
    locationArr=[]; 
    if (savedDayPlans === null || savedDayPlans=== "") {
        savedDayPlans = []; 
    } else {
        savedDayPlans = JSON.parse(savedDayPlans); 
        for (i=0; i<savedDayPlans.length; i++) {
            locationArr.push(savedDayPlans[i].time); 
        }
    }
    
    for (let i=0; i<locationArr.length; i++) {
        let timeBlockElid = "#"+locationArr[i]; 
        let timeBlockEl = $(timeBlockElid).children(".row").children("textarea"); 
        $(timeBlockElid).children(".row").children("button").attr("data-event", "yes"); 
        timeBlockEl.val(savedDayPlans[i].event); 
    }    
}

populateSavedEvents(); 

// Remove local storage

function clearLocalStorage() {
    savedDayPlans=[]; 
    localStorage.setItem("savedDayPlans", savedDayPlans); 
}

// Save for local storage

function saveEvent(time,input){
    alert("You saved your event!"); 
    savedDayPlans.push({"time":time,
    "event": input
    }); 
    localStorage.setItem("savedDayPlans", JSON.stringify(savedDayPlans)); 
}

function removeEvent(index){
    locationArr.splice([index], 1); 
    savedDayPlans.splice([index],1); 
}

function clearEvent(isClear,index,location,buttonEl){
    if (isClear) {
        alert("You cleared this event");
        removeEvent(index); 
        buttonEl.attr("data-event", "none");  
        localStorage.setItem("savedDayPlans", JSON.stringify(savedDayPlans));
    }  else {
        location.val(savedDayPlans[index].event); 
        alert("Event was not cleared"); 
    } 
    console.log("The data-event is set to "+buttonEl.attr("data-event") + " at " +buttonEl.siblings("p").text()); 
}

function changeEvent(time, index, location, buttonEl,eventInput, isPopulated){
    if (eventInput.trim() === "" && isPopulated === "yes"){
        let isSaved= confirm("At "+time+": Would you like to clear the event '"+savedDayPlans[index].event+"' ?"); 
        clearEvent(isSaved,index,location, buttonEl); 
    } else if (eventInput.trim() !== "" && isPopulated ==="none"){
        let isSaved= confirm("At "+time+": Would you like to add the event '"+eventInput+ "'?"); 
        if(isSaved) {
            saveEvent(time, eventInput); 
        }else {
             location.val(""); 
        }
    } else if (eventInput.trim() !== "" && isPopulated=== "yes"){
        if (savedDayPlans[index].event !== eventInput){     
            let isSaved= confirm("At "+time+": Would you like to change the event from '"+savedDayPlans[index].event+"' to '"+eventInput+"'?"); 
            if(isSaved) {
                removeEvent(index); 
                saveEvent(time, eventInput); 
            } else{
                alert("Change was not saved."); 
                location.val(savedDayPlans[index].event); 
            }
        }
     }
}

$(".time-block").delegate("button", "click", function(){
    event.preventDefault();
    let eventInput= $(this).siblings("textarea").val(); 
    let time= $(this).siblings("p").text(); 
    let location = $(this).siblings("textarea"); 
    let isPopulated= $(this).attr("data-event"); 
    let index= locationArr.indexOf(time);
    let buttonEl=$(this); 

    changeEvent(time, index, location, buttonEl, eventInput,isPopulated); 
    populateSavedEvents(); 
}); 
        
// Change of colour depending on the time of day

    //getting the current time of day
let timeOfDay= moment().format("hA"); 

    // Allows user to change time format
let allTimeBlockEl= $(".time-block"); 

 for (let i=0; i<allTimeBlockEl.length; i++){
    let timeBlock= $(allTimeBlockEl[i]); 
    let timeBlockId= timeBlock.attr("id");
    let timeBlockTextarea=timeBlock.children(".row").children("textarea");  
    if (timeBlockId === timeOfDay){
        timeBlockTextarea.addClass("present"); 
    } else if (moment(timeBlockId, "hA").isBefore()) {
        timeBlockTextarea.addClass("past"); 
    } else if (moment(timeBlockId, "hA").isAfter()) {
        timeBlockTextarea.addClass("future"); 
    }
}
   
// Remove all events

$("#clear").on("click",function(){
    if(confirm("Are you sure you want to clear all saved events?")){
       clearLocalStorage(); 
       $(".time-block").find("textarea").val("");
       $(".time-block").find("button").attr("data-event", "none"); 
       locationArr=[];   
      }
})

// Save function
 $("#saveAll").on("click", function(){   
     for( let i=0; i < allTimeBlockEl.length; i++) {
        let timeBlock= $(allTimeBlockEl[i]); 
        let time= timeBlock.attr("id");
        let location=timeBlock.children(".row").children("textarea"); 
        let buttonEl=timeBlock.children(".row").children("button");
        let eventInput= location.val(); 
        let isPopulated= buttonEl.attr("data-event");
        let index= locationArr.indexOf(time);
    
        changeEvent(time, index, location,buttonEl, eventInput,isPopulated);  
        }
    populateSavedEvents(); 
    alert("There are no unsaved changes"); 
 }); 
