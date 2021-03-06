import React from 'react'
import { FadeIn } from 'animate-components'
import Title from '../others/title'
import { connect } from 'react-redux'
import { forProfile, isPrivate, humanReadable } from '../../utils/utils'
import { Redirect, Route, Switch } from 'react-router-dom'
import { getUnreadNotifications } from '../../store/actions/notification-a'
import Banner from './banner'
import Nav from './nav'
import Loading from '../others/loading'
import Nothing from '../others/nothing'

// sections
import Posts from './sections/posts-s'
import Tagged from './sections/tagged-s'
import About from './sections/about-s'
import Shared from './sections/shared-s'
import Gallery from './sections/gallery-s'
import Bookmarks from './sections/bookmarks-s'
import Followers from './sections/followers/followers-s'
import Followings from './sections/followings/followings-s'
import Favourites from './sections/favourites/favourites-s'
import Recommendations from './sections/recommends/recommends'
import PeopleYouKnow from './sections/people-you-know/puk'
import UserGroups from './sections/groups/groups-s'
import { getUnreadMessages } from '../../store/actions/message-a'

@connect(store => (
  {
    ud: store.User.user_details,
    mutuals: store.User.mutualUsers,
    isFollowing: store.Follow.isFollowing
  }
))

export default class Profile extends React.Component {

  state = {
    invalidUser: false,
    loading: true,
    name: '',        // for name not to be undefined in the title
  }

  inv_user = () => this.setState({ invalidUser: true })

  componentDidMount = () => {
    let {
      match: { params: { username } },
      dispatch
    } = this.props
    forProfile({ username, dispatch, invalidUser: this.inv_user })
    dispatch(getUnreadNotifications())
    dispatch(getUnreadMessages())
  }

  componentWillReceiveProps = ({ dispatch, match, ud }) => {
    if (this.props.match.url != match.url) {
      forProfile({ dispatch, username: match.params.username, invalidUser: this.inv_user })
    }
    this.setState({
      loading: false,
      name: `(${ud.firstname} ${ud.surname})`
    })
  }

  render() {
    let
      { invalidUser, loading, name } = this.state,
      { match: { url, params: { username } }, ud, isFollowing, mutuals } = this.props

    return (
      <div>

        { invalidUser ? <Redirect to='/error/user_nf' /> : null }

        <Title value={`@${username} ${name}`} />

        <div
          class='profile-data'
          id='profile-data'
          data-get-username={username}
          data-getid={ud.id}
        ></div>

        { loading ? <Loading/> : null }

        <FadeIn duration='300ms' className={loading ? 'cLoading' : ''} >
          <Banner />
          {
            isPrivate(ud.id, isFollowing, ud.account_type) ?
              <div style={{ marginTop: 85 }} >
                <Nothing
                  mssg={`Account is private. Follow to connect with ${username}!!`}
                  secondMssg={`${ mutuals.length != 0 ? humanReadable(mutuals.length, 'mutual follower') : '' }`}
                />
              </div>
              :
              <div>
                <Nav url={url} />
                <div className='hmm'>
                  <Switch>
                    <Route path={`${url}`} exact component={() => <Posts param={username} />} />
                    <Route path={`${url}/tagged`} component={() => <Tagged param={username} />} />
                    <Route path={`${url}/shared`} component={() => <Shared param={username} />} />
                    <Route path={`${url}/gallery`} component={() => <Gallery param={username} />} />
                    <Route path={`${url}/bookmarks`} component={() => <Bookmarks param={username} />} />
                    <Route path={`${url}/about`} component={About} />
                    <Route path={`${url}/groups`} component={() => <UserGroups param={username} />} />
                    <Route path={`${url}/followers`} component={() => <Followers param={username} />} />
                    <Route path={`${url}/followings`} component={() => <Followings param={username} />} />
                    <Route path={`${url}/favourites`} component={() => <Favourites param={username} />} />
                    <Route path={`${url}/recommendations`} component={() => <Recommendations param={username} />} />
                    <Route path={`${url}/people-you-know`} component={() => <PeopleYouKnow param={username} />} />
                    <Redirect to='/error' />
                  </Switch>
                </div>
              </div>
          }
        </FadeIn>

      </div>
    )
  }
}
