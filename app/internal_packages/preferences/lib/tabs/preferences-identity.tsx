import React from 'react';
import { Actions, IdentityStore, localized, IIdentity } from 'mailspring-exports';
import { RetinaImg } from 'mailspring-component-kit';
import { ipcRenderer } from 'electron';

class RefreshButton extends React.Component<Record<string, unknown>, { refreshing: boolean }> {
  constructor(props) {
    super(props);
    this.state = { refreshing: false };
  }

  _mounted = false;

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  _onClick = () => {
    this.setState({ refreshing: true });
    IdentityStore.fetchIdentity().then(() => {
      setTimeout(() => {
        if (this._mounted) {
          this.setState({ refreshing: false });
        }
      }, 400);
    });
  };

  render() {
    return (
      <div className={`refresh ${this.state.refreshing && 'spinning'}`} onClick={this._onClick}>
        <RetinaImg name="ic-refresh.png" mode={RetinaImg.Mode.ContentIsMask} />
      </div>
    );
  }
}

class PreferencesIdentity extends React.Component<
  Record<string, unknown>,
  { identity: IIdentity | null }
> {
  static displayName = 'PreferencesIdentity';

  unsubscribe: () => void;

  constructor(props) {
    super(props);
    this.state = this._getStateFromStores();
  }

  componentDidMount() {
    this.unsubscribe = IdentityStore.listen(() => {
      this.setState(this._getStateFromStores());
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  _getStateFromStores() {
    return {
      identity: IdentityStore.identity(),
    };
  }

  _onLinkIdentity = () => {
    ipcRenderer.send('command', 'application:add-identity');
  };

  _renderNoIdentity() {
    return (
      <div className="row padded">
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div className="basic-explanation" style={{ display: 'flex' }}>
            {localized(`You are not signed in to Mailspring.`)}
            <div
              className="btn btn-emphasis"
              onClick={this._onLinkIdentity}
              style={{ verticalAlign: 'top', flexShrink: 0, marginLeft: 30 }}
            >
              {localized(`Setup Mailspring ID`)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { identity } = this.state;

    return (
      <div className="container-identity">
        <div className="identity-content-box">
          {identity ? <IdentitySummary identity={identity} /> : this._renderNoIdentity()}
        </div>
      </div>
    );
  }
}

const IdentitySummary: React.FunctionComponent<{ identity: IIdentity }> = (props) => {
  const { firstName, lastName, emailAddress } = props.identity;
  const logout = () => Actions.logoutMailspringIdentity();
  return (
    <div className="row padded">
      <div className="identity-info">
        <RefreshButton />
        <div className="name">
          {firstName} {lastName}
        </div>
        <div className="email">{emailAddress}</div>
        <div className="identity-actions">
          <div className="btn minor-width" onClick={logout}>
            {localized('Sign Out')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesIdentity;
