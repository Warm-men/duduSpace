import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Toast, TYSdk, TYText, Utils, SwitchButton, Popup } from 'tuya-panel-kit';
import { useNavigation } from '@react-navigation/native';
import Res from '@res';
import String from '@i18n';
import LinearGradient from '@components/LinearGradient';
import { getDeviceCloudData, saveDeviceCloudData } from '@api';

const { convert: c, convertX: cx, convertY: cy, isIphoneX } = Utils.RatioUtils;
const CatLitterType: React.FC = (props: any) => {
  const navigation = useNavigation();

  const [type, setType] = useState('');

  useEffect(() => {
    getCatLitterType();
    return () => {
      TYSdk.DeviceEventEmitter.emit('CatLitterTypeCloudChange');
    };
  }, []);

  const getCatLitterType = async () => {
    const res = await getDeviceCloudData('catLitterType');
    if (typeof res === 'string') {
      setType(res);
    }
    if (typeof res === 'object' && res.catLitterType) {
      setType(res.catLitterType);
    }
    if (typeof res === 'object' && !res.catLitterType) {
      setType('');
    }
    console.log('res', res);
  };

  const typeData = [
    {
      image: Res.cat_litter_type_0,
      title: String.getLang('cat_litter_type_0'),
      key: 'cat_litter_type_0',
    },
    {
      image: Res.cat_litter_type_1,
      title: String.getLang('cat_litter_type_1'),
      key: 'cat_litter_type_1',
    },
    {
      image: Res.cat_litter_type_2,
      title: String.getLang('cat_litter_type_2'),
      key: 'cat_litter_type_2',
    },
  ];

  const handleOnSave = async () => {
    await saveDeviceCloudData('catLitterType', `${type}`);
    navigation.goBack();
  };
  return (
    <View style={[styles.flex1, styles.scrollViewStyle]}>
      <View>
        <TYText style={styles.title25Bold}>{String.getLang('cat_litter_type_title')}</TYText>
        <TYText style={styles.text15}>{String.getLang('cat_litter_type_tip')}</TYText>
        <View style={styles.typeView}>
          {typeData.map((item, index) => {
            const isActive = type === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.8}
                onPress={() => setType(item.key)}
                style={[
                  styles.typeItem,
                  styles.center,
                  {
                    backgroundColor: isActive ? '#DFA663' : '#fff',
                    borderColor: isActive ? '#DFA663' : '#E5E0DF',
                  },
                ]}
              >
                <Image source={item.image} style={styles.typeImage} />
                <TYText style={[styles.title14, { color: isActive ? '#fff' : '#ADA49B' }]}>
                  {item.title}
                </TYText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View>
        <View style={styles.bottomTextView}>
          <TYText style={styles.text14}>{String.getLang('cat_litter_type_tip_title')}</TYText>
          <TYText style={styles.text12}>{String.getLang('cat_litter_type_tip_1')}</TYText>
        </View>
        <LinearGradient style={styles.buttonStyle}>
          <TouchableOpacity
            style={[styles.buttonViewStyle]}
            onPress={handleOnSave}
            activeOpacity={0.65}
          >
            <TYText style={styles.text15White}>{String.getLang('confirm')}</TYText>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

export default CatLitterType;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  scrollViewStyle: {
    paddingHorizontal: cx(30),
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    width: cx(315),
    height: cx(50),
    borderRadius: cx(25),
    overflow: 'hidden',
    marginBottom: cx(44),
  },
  buttonViewStyle: {
    width: cx(315),
    height: cx(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title25Bold: {
    fontSize: cx(25),
    fontWeight: 'bold',
    color: '#49362F',
    marginTop: cx(15),
  },
  text15: {
    fontSize: cx(15),
    color: '#7C7269',
    marginTop: cx(17),
  },
  text15White: {
    fontSize: cx(15),
    color: '#fff',
  },
  title14: {
    fontSize: cx(14),
    color: '#ADA49B',
    marginTop: cx(10),
  },
  typeView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: cx(40),
  },
  typeItem: {
    width: cx(98),
    height: cx(98),
    borderRadius: cx(10),
    backgroundColor: '#fff',
    borderWidth: cx(1),
    borderColor: '#E5E0DF',
  },
  typeImage: {
    width: cx(35),
    height: cx(35),
  },
  text14: {
    fontSize: cx(14),
    color: '#49362F',
    marginBottom: cx(15),
  },
  text12: {
    fontSize: cx(12),
    color: '#ADA49B',
    lineHeight: cx(19),
  },
  bottomTextView: {
    marginBottom: cx(30),
  },
});
