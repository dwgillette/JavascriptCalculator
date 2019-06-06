import React from 'react';
import './App.scss';

const operatorAtEnd = /[*/+-]$/i,
      isOperator = /[x/+-]$/i,
      hasOperator = /[^(][*/+-]/,
      hasSolution = /[=]/,
      isNegative = /^[-]/,
      hasDecimal = /[\.]/,
      decimalAtEnd = /[\.]$/,
      paranthAtEnd = /[\)]$/,
      loggedNegative = /\(.*\)$/,
      limitMessage = 'DIGIT LIMIT MET'

class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '0',
      log: '',
      storedInput: '', // needed for trigger happy individuals who reach the digit limit
      mostRecentInput: '', // needed for handling percentage at times
      mostRecentLog: '', // needed for handling percentage at times
      solution: ''
    }
    this.handleNumber = this.handleNumber.bind(this);
    this.handleDecimal = this.handleDecimal.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleOperator = this.handleOperator.bind(this);
    this.evaluate = this.evaluate.bind(this);
    this.handlePercentage = this.handlePercentage.bind(this);
    this.handleNegation = this.handleNegation.bind(this);
    this.handleLimit = this.handleLimit.bind(this);
  }
  
  handleNumber(num) {
    if (hasSolution.test(this.state.log)) { // if last action was finding a solution, resets display
      this.setState({
        input: num.toString(),
        log: num.toString()
      })    
    } else if (this.state.input.length >= 21 || this.state.input.includes('LIMIT')) { // handles digit limit
      this.handleLimit();
    } else if (isNaN(this.state.input)) { // action if last input was operator
      this.setState({
        input: num.toString(),
        log: this.state.log + num,
      })
    } else if (loggedNegative.test(this.state.log)) { // if last input was a negative number, resets input
      this.setState({
        input: num.toString(),
        log: this.state.log.replace(loggedNegative, '') + num.toString()
      })
    } else {
      this.setState({
        input: this.state.input == '0' ? // replaces 0 or adds to number
          num.toString() :
          this.state.input + num,
        log: num == 0 && hasDecimal.test(this.state.input) ? // handles 0 as input and allows you to rack up zeros behind decimal of zero value eg. '0.00000'
          this.state.log + num :
          num == 0 && this.state.input == 0 ? // keeps you from racking up zeros if no decimal is present
          this.state.log :
          this.state.log + num,
        storedInput: this.state.input + num, // stores input for post-Digit Limit Alert input state
      })
    }
  }
  
  handleDecimal(dec) {
    if (hasSolution.test(this.state.log)) { // if last action was finding a solution, resets display
      this.setState({
        input: '0.',
        log: '0.'
      })    
    } else if (this.state.input.length >= 21 || this.state.input.includes('LIMIT')) { // handles digit limit
      this.handleLimit();
    } else if (loggedNegative.test(this.state.log)) { // if last input was a negative number, resets input
      this.setState({
        input: '0.',
        log: this.state.log.replace(loggedNegative, '') + '0.'
      })
    } else if (!this.state.input.includes(dec)) { // only runs if decimal not already present in input
      this.setState({
        input: isOperator.test(this.state.input) ?
          '0.':
          this.state.input + dec,
        log: this.state.input == '0' && this.state.log == '' ?
          '0.' :
          isOperator.test(this.state.input) ?
          this.state.log + '0.' :
          paranthAtEnd.test(this.state.log) ? 
          this.state.log.replace(')','') + '.)' :
          this.state.log + dec,
        mostRecentInput: this.state.input
      })
    } 
  }
  
  handleLimit() {
    this.setState({
        input: limitMessage
      })
      setTimeout(() => {
        this.setState({
          input: this.state.storedInput
        })
      }, 1000)
  }
  
  handleClear() {
    this.setState({
      input: '0',
      log: '',
      result: '',
      mostRecentInput: '',
      mostRecentLog: ''
    })
  }
  
  handleOperator(op) {
    let activeLog
    if (hasSolution.test(this.state.log)) {
      activeLog = this.state.solution
    } else {
      activeLog = this.state.log
    }
    if (this.state.log != '') {
      this.setState({
        input: op,
        storedInput: op,
        log: isOperator.test(this.state.input) ?
          activeLog.slice(0,-1) + op.replace(/x/g, '*') :
          activeLog + op.replace(/x/g, '*'),
        mostRecentInput: this.state.input,
        mostRecentLog: operatorAtEnd.test(this.state.log) ?
          activeLog.slice(0,-1) + op.replace(/x/g, '*') :
          activeLog + op.replace(/x/g, '*')
      })
    }
    console.log(operatorAtEnd.test(this.state.log));
  }

  handlePercentage() {
    // in the event that this.state.input ends with a decimal, decPercent will be needed for calculation
    let percentage = (Math.round(100000000000000 * (this.state.input / 100)) / 100000000000000).toString();
    let decPercent = (Math.round(100000000000000 * (this.state.input.slice(0,-1) /100)) / 100000000000000).toString();
    if (this.state.log != ('' || "0.") && percentage != 0 && !isOperator.test(this.state.input)) {
      if (decimalAtEnd.test(this.state.input)) {
        this.setState({
          input: decPercent,
          log: isNegative.test(decPercent) ?
            this.state.mostRecentLog + '(' + decPercent + ')' :
            this.state.mostRecentLog + decPercent
        })
      } else if (this.state.input != '0'){
        this.setState({
          input: percentage,
          log: hasSolution.test(this.state.log) && isNegative.test(this.state.input) ?
            '(' + percentage + ')' :
            hasSolution.test(this.state.log) ?
            percentage :
            isNegative.test(percentage) ?
            this.state.mostRecentLog + '(' + percentage + ')' :
            this.state.mostRecentLog + percentage,
          mostRecentLog: hasSolution.test(this.state.log) ?
            '' :
            this.state.mostRecentLog
        })
      }
    }
  }

  handleNegation() {
    let previousInput
    if (isNegative.test(this.state.input)) {
      previousInput = new RegExp('.*(?=\\(' + this.state.input + '\\)' + '$)')
    } else {
      previousInput = new RegExp('.*(?=' + this.state.input + '$)')
    }
    let previousLog = this.state.log.match(previousInput);
    if (parseFloat(this.state.input) != 0 && !isOperator.test(this.state.input)) {
      if (isNegative.test(this.state.input)) {
        this.setState({
          input: this.state.input.replace('-',''),
          log: hasSolution.test(this.state.log) ?
            this.state.input.replace('-','') :
            previousLog + this.state.input.replace('-',''),
          mostRecentInput: this.state.input
        })
      } else {
        this.setState({
          input: '-' + this.state.input,
          log: hasSolution.test(this.state.log) ?
            '(-' + this.state.input + ')' :
            previousLog + '(-' + this.state.input + ')',
          mostRecentInput: this.state.input
        })
      }
    }
  }
  
  evaluate() {
    let answer
    if (operatorAtEnd.test(this.state.log)) {
      answer = (Math.round(100000000000000 * (eval(this.state.log.slice(0,-1)))) / 100000000000000).toString()  
    } else {
      answer = (Math.round(100000000000000 * (eval(this.state.log))) / 100000000000000).toString()
    }
    if (!this.state.input.includes('LIMIT') && hasOperator.test(this.state.log)) {
      this.setState({
        input: answer,
        log: operatorAtEnd.test(this.state.log) ?
          this.state.log.slice(0,-1) + '=' + answer :
          this.state.log + '=' + answer,
        solution: answer,
        mostRecentLog: ''
      })
    }
  }
  
  render() {
    return(
      <div className='container'>
        <Display input={this.state.input} log={this.state.log}/>
        <div className='buttonPad'>
          <button id='clear' onClick={this.handleClear}>AC</button>
          <button className='method' id='negate' onClick={this.handleNegation}>+/-</button>
          <button className='method' id='percent' onClick={this.handlePercentage}>%</button>
          <Operator id='divide' value={'/'} onClick={this.handleOperator}/>
          
          <Number id='seven' value={7} onClick={this.handleNumber}/>
          <Number id='eight' value={8} onClick={this.handleNumber}/>
          <Number id='nine' value={9} onClick={this.handleNumber}/>
          <Operator id='multiply' value={'x'} onClick={this.handleOperator}/>
          
          <Number id='four' value={4} onClick={this.handleNumber}/>
          <Number id='five' value={5} onClick={this.handleNumber}/>
          <Number id='six' value={6} onClick={this.handleNumber}/>
          <Operator id='subtract' value={'-'} onClick={this.handleOperator}/>
          
          <Number id='one' value={1} onClick={this.handleNumber}/>
          <Number id='two' value={2} onClick={this.handleNumber}/>
          <Number id='three' value={3} onClick={this.handleNumber}/>
          <Operator id='add' value={'+'} onClick={this.handleOperator}/>
          
          <Number id='zero' value={0} onClick={this.handleNumber}/>
          <div/>
          <Number id='decimal' value={'.'} onClick={this.handleDecimal}/>
          <button className='operator' id='equals' onClick={this.evaluate}>=</button>
        </div>
      </div>
    );
  }
}

const Display = (props) => {
  return(
    <div className='display'>
      <div className='log'>{props.log}</div>
      <div className='input' id='display'>{props.input}</div>
    </div>
  )
}

const Number = (props) => {
  return(
    <button className='number' id={props.id} onClick={() => props.onClick(props.value)}>
      {props.value}
    </button>
  )
}

const Operator = (props) => {
  return(
    <button className='operator' id={props.id} onClick={() => props.onClick(props.value)}>
      {props.value}
    </button>
  )
}

export default Calculator;
