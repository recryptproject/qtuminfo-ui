<template>
  <div ref="transaction-list">
    <Pagination v-if="pages > 1" :pages="pages" :currentPage="currentPage" :getLink="getLink" />
    <div class="card section-card transaction-list">
      <div class="card-body">
        <Transaction v-for="transaction in transactions" :key="transaction.id"
          :transaction="transaction" :highlightAddress="id"
          @transaction-change="tx => transactionChange(transaction, tx)" />
      </div>
    </div>
    <Pagination v-if="pages > 1" :pages="pages" :currentPage="currentPage" :getLink="getLink" />
  </div>
</template>

<script>
  import Vue from 'vue'
  import Contract from '@/models/contract'
  import Transaction from '@/models/transaction'
  import {RequestError} from '@/services/recryptinfo-api'
  import {scrollIntoView} from '@/utils/dom'

  export default {
    data() {
      return {
        totalCount: 0,
        transactions: [],
        currentPage: Number(this.$route.query.page || 1)
      }
    },
    props: {
      rrc20: {required: true}
    },
    async asyncData({req, params, query, redirect, error}) {
      try {
        if (query.page && !/^[1-9]\d*$/.test(query.page)) {
          redirect(`/contract/${params.id}/`)
        }
        let page = Number(query.page || 1)
        let {totalCount, transactions} = await Contract.getTransactions(
          params.id,
          {from: (page - 1) * 20, to: page * 20},
          {ip: req && req.ip}
        )
        if (page > 1 && totalCount <= (page - 1) * 20) {
          redirect(`/contract/${params.id}/`, {page: Math.ceil(totalCount / 20)})
        }
        transactions = await Transaction.get(transactions, {ip: req && req.ip})
        return {
          totalCount,
          transactions
        }
      } catch (err) {
        if (err instanceof RequestError) {
          if (err.code === 404) {
            error({statusCode: 404, message: `Contract ${param.id} not found`})
          } else {
            error({statusCode: err.code, message: err.message})
          }
        } else {
          error({statusCode: 500, message: err.message})
        }
      }
    },
    computed: {
      id() {
        return this.$route.params.id
      },
      pages() {
        return Math.ceil(this.totalCount / 20)
      }
    },
    methods: {
      getLink(page) {
        return {name: 'contract-id', params: {id: this.id}, query: {page}}
      },
      transactionChange(oldTransaction, newTransaction) {
        Vue.set(oldTransaction, 'blockHeight', newTransaction.block.height)
        Vue.set(oldTransaction, 'blockHash', newTransaction.block.hash)
        oldTransaction.tokenTransfers = newTransaction.tokenTransfers
      }
    },
    async beforeRouteUpdate(to, from, next) {
      let page = Number(to.query.page || 1)
      let {totalCount, transactions} = await Contract.getTransactions(
        this.id,
        {from: (page - 1) * 20, to: page * 20}
      )
      this.totalCount = totalCount
      if (page > this.pages && this.pages > 1) {
        this.$router.push({
          name: 'contract-id',
          params: {id: this.id},
          query: {page: Math.ceil(totalCount / 20)}
        })
        return
      }
      this.transactions = await Transaction.get(transactions)
      this.currentPage = page
      next()
      scrollIntoView(this.$refs['transaction-list'])
    },
    scrollToTop: true
  }
</script>

</style>
