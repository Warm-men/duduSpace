import { commonStyles, cx } from '@config';
import Res from '@res';
import React from 'react';
import { Image, StyleProp, StyleSheet, View } from 'react-native';
import { TYText } from 'tuya-panel-kit';

interface Props {
  containerStyle?: StyleProp;
  imgStyle?: StyleProp;
  desc?: string;
  descStyle?: StyleProp;
}

const Empty: React.FC<Props> = ({ containerStyle, imgStyle, desc, descStyle }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Image source={Res.empty} style={[styles.img, imgStyle]} />
      {!!desc && (
        <TYText color="#ADA49B" size={cx(15)} style={descStyle}>
          {desc}
        </TYText>
      )}
    </View>
  );
};

export default Empty;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: cx(198),
  },
  img: {
    width: cx(165),
    height: cx(151),
  },
});
