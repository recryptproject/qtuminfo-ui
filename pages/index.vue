<template>
  <div class="container">
    <section class="columns is-multiline is-desktop">
      <div class="column is-half">
        <div class="card">
          <div class="card-header">
            <div class="card-header-icon">
              <Icon icon="cubes" fixedWidth />
            </div>
            <h3 class="card-header-title">
              {{ $tc('blockchain.block', 2) }}
            </h3>
            <nuxt-link to="/block" class="card-header-button button is-recrypt is-outlined">
              {{ $t('action.view_all') }}
            </nuxt-link>
          </div>
          <div class="card-body">
            <div v-for="block in recentBlocks" class="recrypt-block is-size-7" :key="block.hash">
              <div class="level">
                <div class="level-left">
                  <nuxt-link :to="{name: 'block-id', params: {id: block.height}}"
                    class="level-item recrypt-block-box has-text-centered">
                    {{ $tc('blockchain.block', 1) }} #{{ block.height }}
                    <FromNow :timestamp="block.timestamp" />
                  </nuxt-link>
                  <div class="level-item">
                    <div>
                      <i18n path="block.brief.address">
                        <AddressLink :address="block.minedBy" />
                      </i18n>
                      <br>
                      {{ $t('block.brief.transaction', [block.txLength, block.duration]) }}
                      <br>
                      <span class="monospace">
                        {{ $t('block.brief.reward') }} {{ block.reward | recrypt }} RECRYPT
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column is-half">
        <div class="card">
          <div class="card-header">
            <div class="card-header-icon">
              <Icon icon="list-alt" fixedWidth />
            </div>
            <h3 class="card-header-title">
              {{ $tc('blockchain.transaction', 2) }}
            </h3>
          </div>
          <div class="card-body">
            <div v-for="transaction in recentTransactions" :key="transaction.id" class="is-size-7 transaction">
              <div class="level">
                <TransactionLink :transaction="transaction.id" class="level-left" />
                <span class="level-right">{{ transaction.valueOut | recrypt }} RECRYPT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  import Block from "@/models/block"

  export default {
    head() {
      return {
        title: 'recrypt.info',
        titleTemplate: null
      }
    },
    data() {
      return {
        recentBlocks: [],
        recentTransactions: []
      }
    },
    async asyncData({req}) {
      let recentBlocks = await Block.getRecentBlocks({ip: req && req.ip})
      return {recentBlocks}
    },
    mounted() {
      this.$websocket.subscribe('block')
      this.$websocket.subscribe('mempool/transaction')
      this.$websocket.on('block', block => {
        block.txLength = block.tx.length
        this.recentBlocks.unshift(block)
        this.recentBlocks.pop()
      })
      this.$websocket.on('mempool/transaction', transaction => {
        this.recentTransactions.unshift(transaction)
        if (this.recentTransactions.length > 27) {
          this.recentTransactions.pop()
        }
      })
    },
    beforeDestroy() {
      this.$websocket.unsubscribe('block')
      this.$websocket.unsubscribe('mempool/transaction')
    }
  }
</script>

<style lang="less" scoped>
  @import '../styles/variables.less';

  .columns.is-desktop {
    margin: 0;
  }

  .recrypt-block {
    padding: 1em;
    border-top: 1px solid #eee;
    &:first-child {
      border-top: none;
    }
  }

  .recrypt-block-box {
    flex-direction: column;
    min-width: 11em;
    padding: 1em;
    background-color: #eee;
    color: inherit;
    &:hover {
      outline: 1px solid @recrypt;
    }
  }

  .transaction {
    padding: 0.5em 1em;
    border-top: 1px solid #eee;
    &:first-child {
      border-top: none;
    }
    font-family: monospace;
  }
</style>
