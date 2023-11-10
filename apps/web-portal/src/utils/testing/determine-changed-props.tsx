import { Component, ComponentClass } from 'react';

interface Props {
  [key: string]: any;
}

export default function withPropsChecker(WrappedComponent: any): ComponentClass<Props> {
  return class PropsChecker extends Component<Props> {
    override UNSAFE_componentWillReceiveProps(nextProps: Props) {
      Object.keys(nextProps)
        .filter((key) => nextProps[key] !== this.props[key])
        .forEach((key) => {
          // eslint-disable-next-line no-console
          console.log('changed property:', key, 'from', this.props[key], 'to', nextProps[key]);
        });
    }

    override render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}
