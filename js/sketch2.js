//	Main code for a suite of text analysis / visualization tools for the web
//	Adapted from Code 2 Data Poetics, SP16, Bryan Ma
//		& Daniel Shiffman's A2Z example
//	Uses P5.js, D3.js, and Bootstrap for the web interface

var dropzone, input, button;
var theText;

var totalSyllables = 0;
var totalSentences = 0;
var totalWords = 0;

var avgWordsPerSentence = 0;
var avgSyllablesPerSentence = 0;
var avgSyllablesPerWord = 0;
var avgWordsPerSentence = 0;

var flesch = 0;
var readability = 0;		//	Reading difficulty based off of Flesch index

var concordance = {};
var tokens = [];
var phrases;
var keys = [];
var keysArray = [];
var concordanceKeysArray = [];

var wordCounterString;
var frequentWords = [];
var frequentWordsCount = [];
var report = "";

var reportDiv;

function setup() {
  noCanvas();
  input = select('#textinput');
  button = select('#submit');
  button.mousePressed(handleInput);
  dropzone = select('#dropzone');
  dropzone.dragOver(highlight);
  dropzone.dragLeave(unhighlight);
  dropzone.drop(gotFile, unhighlight);
}

function highlight() {
  dropzone.style('background', '#AAA');
}

function unhighlight() {
  dropzone.style('background', '');
}

function gotFile(file) {
  if (file.type === 'text') {
    theText = file.data;
    beginProcessing(theText);

	var parent = document.getElementById("innerCover");
	var child = document.getElementById("lead");
	parent.removeChild(child);
	child = document.getElementById("cover-heading");
	parent.removeChild(child);
	parent = document.getElementById("dropzone");
	parent.remove();
	parent = document.getElementById("textInputArea");
	parent.remove();
	parent = document.getElementById("submitButton");
	parent.remove();
  } else {
    alert('That was not a text file!');
  }
  //	Hides all the previous HTML elements once user submits data



  // document.getElementById("lead").style.visibility = "hidden";
  // document.getElementById("cover-heading").style.visibility = "hidden";
  // document.getElementById("dropzone").style.visibility = "hidden";
  // document.getElementById("textInputArea").style.visibility = "hidden";
  // document.getElementById("submitButton").style.visibility = "hidden";
}

function handleInput() {
  theText = input.value();
  beginProcessing(theText);
  var parent = document.getElementById("innerCover");
  var child = document.getElementById("lead");
  parent.removeChild(child);
  child = document.getElementById("cover-heading");
  parent.removeChild(child);
  parent = document.getElementById("dropzone");
  parent.remove();
  parent = document.getElementById("textInputArea");
  parent.remove();
  parent = document.getElementById("submitButton");
  parent.remove();
  //	Hides all the previous HTML elements once user submits data
  // document.getElementById("lead").style.visibility = "hidden";
  // document.getElementById("cover-heading").style.visibility = "hidden";
  // document.getElementById("dropzone").style.visibility = "hidden";
  // document.getElementById("textInputArea").style.visibility = "hidden";
  // document.getElementById("submitButton").style.visibility = "hidden";

}

//	The initial text processing: Worcd counter, sentence counting
function beginProcessing (data) {

  var len = data.length;
  if (data.length === 0) {
    alert("Nothing entered");
  } else {

  	data = data.toLowerCase();
    //look for word delimiters
    var delimiters = '.:;?! !@#$%^&*()+';
    var words = splitTokens(data, delimiters);  //http://p5js.org/reference/#/p5/splitTokens
    tokens = words;
    tokens 
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
    
      totalSyllables += countSyllables(word);
      totalWords++;
    }

    //look for sentence delimiters
    var sentenceDelim = '.:;?!';
    var sentences = splitTokens(data, sentenceDelim);
    phrases = sentences;
    totalSentences = sentences.length;

    calculateFlesch(totalSyllables, totalWords, totalSentences);
    findWordFrequency();

    avgWordsPerSentence = totalWords / totalSentences;
    avgSyllablesPerSentence = totalSyllables / totalSentences;
    avgSyllablesPerWord = totalSyllables / totalWords;
	flesch = + flesch.toFixed(3);
	avgWordsPerSentence = +avgWordsPerSentence.toFixed(3);
	avgSyllablesPerSentence = +avgSyllablesPerSentence.toFixed(3);
	avgSyllablesPerWord = +avgSyllablesPerWord.toFixed(3);
    report += "Total Syllables  :  " + totalSyllables + "<br>";
    report += "Total Words  :  " + totalWords + "<br>";
    report += "Total Sentences  :  " + totalSentences + "<br>";
    report += "Avg Words Per Sentence  :  " + avgWordsPerSentence + "<br>";
    report += "Avg Syllables Per Word  :  " + avgSyllablesPerWord + "<br>";
    report += "Avg Syllables Per Sentence  :  " + avgSyllablesPerSentence + "<br>";
    report += "Flesch Readability Index  :  " + flesch + "<br>";
    // report += "Word Frequency Counter (Ignore the 'undefined')  :  "  + "<br>";
    // report += wordCounterString;
    // var wordCounterString = keys[i] + " : " + concordance[keys[i];
    //	Readability scales the Flesch index into a more managable number
    readability = flesch;

    // var basicTextResults = createP(report);
    createNewDiv();
  }
}

function createNewDiv() {
	reportDiv = createDiv(report);
	  // text.style("color", black);
	reportDiv.class("reportDiv");
	reportDiv.position(50, 50);
}

//	Calculates the Flesch reading ease
function calculateFlesch(totalSyllables, totalWords, totalSentences) {
   	var f1 = 206.835;
    var f2 = 84.6;
    var f3 = 1.015;
    var r1 = totalSyllables / totalWords;
    var r2 = totalWords / totalSentences;
    flesch = f1 - (f2 * r1) - (f3 * r2);
    return flesch;
}

//count syllables of a word based on number of vowels
function countSyllables(word) {
  var syl = 0;
  var vowel = false;
  
  //check each word for vowels (don't count more than one vowel in a row)
  for (var i = 0; i < word.length; i++) {
    if (isVowel(word.charAt(i)) && (vowel == false)) {
      vowel = true;
      syl++;
    } else if (isVowel(word.charAt(i)) && (vowel == true)) {
      vowel = true;
    } else {
      vowel = false;
    }
  }
  
  var tempChar = word.charAt(word.length-1);
  //check for an 'e' at the end, as long as its not a word with one syllable
  //this is something we would need to change if we wanted this to analyze more than one word.
  if ((tempChar == 'e' || tempChar == 'E') && syl != 1) {
    syl--;
  }
  return syl;
}

function isVowel(c) {
  if      ((c == 'a') || (c == 'A')) { return true; }
  else if ((c == 'e') || (c == 'E')) { return true; }
  else if ((c == 'i') || (c == 'I')) { return true; }
  else if ((c == 'o') || (c == 'O')) { return true; }
  else if ((c == 'u') || (c == 'U')) { return true; }
  else if ((c == 'y') || (c == 'Y')) { return true; }
  else { return false; }
}

function findWordFrequency() {
  for (var i = 0; i < tokens.length; i++) {
    var word = tokens[i];
    if (concordance[word] === undefined) {
      concordance[word] = 1;
      keys.push(word); //if we have a new word, add it to the array.
    } else {
      concordance[word]++;
    }
  }
  keys.sort(function(a, b) {
    return (concordance[b] - concordance[a]);
  });

  //or,
  // var concordanceSort = function(a, b) {
  //   return (concordance[b] - concordance[a]);
  // }
  // keys.sort(concordanceSort);

  //next, now that we have sorted keys, we can iterate over the concordance.
  for (var i = 0; i < keys.length; i++) {
    console.log(keys[i] + ': ' + concordance[keys[i]]); //THIS IS THE IMPORTANT PART!
    wordCounterString +=  "<br>" + keys[i] + " : " + concordance[keys[i]];

    keysArray.push(keys[i]);
    concordanceKeysArray.push(concordance[keys[i]]);
  	if (concordance[keys[i]] > 5) {
  		frequentWords.push(keys[i]);
  		frequentWordsCount.push(concordance[keys[i]]); 
  	}
  } 
  // console.log(frequentWords);
  ellipse()
}

function draw() {

}