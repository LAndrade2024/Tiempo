<template>
<datepicker :placeholder="placeholder" @input="input" format="dd/MM/yyyy" v-model="fecha" :clear-button="clearButton"></datepicker>
</template>
<script>
import {
  datepicker,
} from 'vue-strap';

const fechaAIso = (i) => String(i).split('/').reverse().join('-');
const isoAFecha = (i) => i === null? '' :  String(i).split('-').reverse().join('/');
let hoy = isoAFecha(SERVER.date);
datepicker.methods.getDateRange = function () {
  this.dateRange = []
  this.decadeRange = []
  const time = {
    year: this.currDate.getFullYear(),
    month: this.currDate.getMonth(),
    day: this.currDate.getDate()
  }
  const yearStr = time.year.toString()
  const firstYearOfDecade = (yearStr.substring(0, yearStr.length - 1) + 0) - 1
  for (let i = 0; i < 12; i++) {
    this.decadeRange.push({
      text: firstYearOfDecade + i
    })
  }

  const currMonthFirstDay = new Date(time.year, time.month, 1)
  let firstDayWeek = currMonthFirstDay.getDay() + 0
  if (firstDayWeek === 0) {
    firstDayWeek = 7
  }
  const dayCount = this.getDayCount(time.year, time.month)
  if (firstDayWeek > 1) {
    const preMonth = this.getYearMonth(time.year, time.month - 1)
    const prevMonthDayCount = this.getDayCount(preMonth.year, preMonth.month)
    for (let i = 1; i < firstDayWeek; i++) {
      const dayText = prevMonthDayCount - firstDayWeek + i + 1
      const date = new Date(preMonth.year, preMonth.month, dayText)
      let sclass = 'datepicker-item-gray'
      if (this.disabledDaysArray.indexOf(date.getDay()) > -1) {
        sclass = 'datepicker-item-disable'
      }
      this.dateRange.push({text: dayText, date, sclass })
    }
  }

  for (let i = 1; i <= dayCount; i++) {
    const date = new Date(time.year, time.month, i)
    let sclass = ''
    if (this.disabledDaysArray.indexOf(date.getDay()) > -1) {
      sclass = 'datepicker-item-disable'
    }
    if (i == time.day && date.getFullYear() == time.year && date.getMonth() == time.month){
      sclass = 'datepicker-dateRange-item-active'
    }
    this.dateRange.push({text: i, date, sclass})
  }

  if (this.dateRange.length < 42) {
    const nextMonthNeed = 42 - this.dateRange.length
    const nextMonth = this.getYearMonth(time.year, time.month + 1)

    for (let i = 1; i <= nextMonthNeed; i++) {
      const date = new Date(nextMonth.year, nextMonth.month, i)
      let sclass = 'datepicker-item-gray'
      if (this.disabledDaysArray.indexOf(date.getDay()) > -1) {
        sclass = 'datepicker-item-disable'
      }
      this.dateRange.push({text: i, date, sclass})
    }
  }
}

export default {
  components: {
    datepicker,
  },
  computed: {
    fecha() {
      return isoAFecha(this.value);
    }
  },
  mounted() {

  },
  props: {
    clearButton: Boolean,
    value: {
      type: String,
      default: hoy,
    },
    placeholder: String,
  },

  methods: {
    input(e) {
      this.$emit('input', e.split('/').reverse().join('-'));
    }
  },
  watch: {

  }
}
</script>
