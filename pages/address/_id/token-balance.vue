<template>
  <div>
    <form class="select-tokens" @submit.prevent>
      <label v-for="token in tokens" class="checkbox">
        <input type="checkbox" :value="token.address" v-model="selectedTokens">
        {{ token.name }} ({{ token.symbol }})
      </label>
    </form>
    <div ref="list">
      <Pagination v-if="pages > 1" :pages="pages" :currentPage="currentPage" :getLink="getLink" />
      <table class="table is-fullwidth is-bordered is-striped">
        <thead>
          <tr>
            <th>{{ $t('address.timestamp') }}</th>
            <th>{{ $t('address.transaction_id') }}</th>
            <th>{{ $t('address.changes') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="{id, block, data} in transactions">
            <td>{{ block.timestamp | timestamp }}</td>
            <td>
              <TransactionLink :transaction="id" />
            </td>
            <td class="monospace">
              <div v-for="{token, amount} in data">
                <span v-if="amount > 0">+</span>
                <span v-else-if="amount < 0">-</span>
                <span v-else>&nbsp;</span>
                {{ amount.replace('-', '') | rrc20(token.decimals) }}
                <AddressLink :address="token.address">
                  {{ token.symbol || $t('contract.token.tokens') }}
                </AddressLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination v-if="pages > 1" :pages="pages" :currentPage="currentPage" :getLink="getLink" />
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import Address from '@/models/address'
  import {RequestError} from '@/services/recryptinfo-api'
  import {scrollIntoView} from '@/utils/dom'

  export default {
    data() {
      return {
        totalCount: 0,
        transactions: [],
        currentPage: Number(this.$route.query.page || 1),
        selectedTokens: this.tokens.map(token => token.address)
      }
    },
    props: {
      tokens: {type: Array, required: true}
    },
    async asyncData({req, params, query, redirect, error}) {
      try {
        if (query.page && !/^[1-9]\d*$/.test(query.page)) {
          redirect(`/address/${params.id}/token-balance`)
        }
        let page = Number(query.page || 1)
        let {totalCount, transactions} = await Address.getTokenBalanceTransactions(
          params.id,
          {from: (page - 1) * 100, to: page * 100, tokens: query.tokens},
          {ip: req && req.ip}
        )
        if (page > 1 && totalCount <= (page - 1) * 100) {
          redirect(`/address/${params.id}/token-balance`, {page: Math.ceil(totalCount / 100)})
        }
        return {totalCount, transactions, ...(query.tokens ? {selectedTokens: query.tokens.split(',')} : {})}
      } catch (err) {
        if (err instanceof RequestError) {
          error({statusCode: err.code, message: err.message})
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
        return Math.ceil(this.totalCount / 100)
      }
    },
    methods: {
      getLink(page) {
        return {
          name: 'address-id-token-balance',
          params: {id: this.id},
          query: {
            page,
            tokens: this.selectedTokens.join(',')
          }
        }
      }
    },
    watch: {
      selectedTokens(value, oldValue) {
        this.$router.push({
          name: 'address-id-token-balance',
          params: {id: this.id},
          ...(this.selectedTokens.length ? {query: {tokens: this.selectedTokens.join(',')}} : {})
        })
      }
    },
    async beforeRouteUpdate(to, from, next) {
      let page = Number(to.query.page || 1)
      let tokens = to.query.tokens
      let {totalCount, transactions} = await Address.getTokenBalanceTransactions(
        this.id,
        {from: (page - 1) * 100, to: page * 100, tokens}
      )
      this.totalCount = totalCount
      if (page > this.pages && this.pages > 1) {
        this.$router.push({
          name: 'address-id-token-balance',
          params: {id: this.id},
          query: {page: Math.ceil(totalCount / 100), ...(tokens ? {tokens} : {})}
        })
        return
      }
      this.transactions = transactions
      this.currentPage = page
      if (!tokens) {
        this.selectedTokens = this.tokens.map(token => token.address)
      }
      next()
      scrollIntoView(this.$refs.list)
    },
    scrollToTop: true
  }
</script>

<style lang="less" scoped>
  .select-tokens {
    display: flex;
    flex-flow: wrap;
    margin-bottom: 1em;
    .checkbox {
      margin-right: 1em;
    }
  }
  .pagination {
    padding: 1em;
  }
</style>
