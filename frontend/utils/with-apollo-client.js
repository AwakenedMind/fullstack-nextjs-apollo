import React from 'react'
import initApollo from './init-Apollo'
import { getDataFromTree } from 'react-apollo'
import Head from 'next/head'

// App is a HOC that allows us to conditionally enhance our Apollo Component depending if its rendered in the DOM or the server
export default App => {
  return class Apollo extends React.Component {
    static displayName = 'withApollo(App)'
    static async getInitialProps(ctx) {
      const { Component, router } = ctx

      let appProps = {}

      if (App.getInitialProps) {
        appProps = await App.getInitialProps(ctx)
      }

      const apollo = initApollo()

      // Check If container is running in the DOM
      if (typeof window === 'undefined') {
        try {
          // Inject Apollo Client into our root <App /> component as a prop
          await getDataFromTree(
            <App {...appProps} Component={Component} router={router} apolloClient={apollo} />
          )
        } catch (error) {
          console.error('Error while running getDataFromTree ', error)
        }
        // React Helmet Substitute <head /> injection
        Head.rewind()
      }
      // We need to extract Apollo's cache to support SSR
      // store hydration of initial state
      const apolloState = apollo.cache.extract()

      return {
        ...appProps,
        apolloState
      }
    }
    constructor (props) {
      super(props)
      this.apolloClient = initApollo(props.apolloState)
    }

    render() {
      return <App {...this.props} apolloClient={this.apolloClient} />
    }
  }
}