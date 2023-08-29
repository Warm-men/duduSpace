import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TYText, Utils } from 'tuya-panel-kit';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { actions } from '@models';
import Res from '@res';
import String from '@i18n';
import LinearGradient from '@components/LinearGradient';
import { saveDeviceCloudData } from '@api';

const { convertX: cx } = Utils.RatioUtils;
const CatLitterType: React.FC = (props: any) => {
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const { catLitterType } = useSelector(({ cloudData }: any) => cloudData);

  const [type, setType] = useState(catLitterType);

  useEffect(() => {
    if (catLitterType) {
      setType(catLitterType);
    }
  }, [catLitterType]);

  const typeData = [
    {
      image: Res.cat_litter_type_0,
      imageActive: Res.cat_litter_type_0_1,
      title: String.getLang('cat_litter_type_0'),
      key: 'cat_litter_type_0',
    },
    {
      image: Res.cat_litter_type_1,
      imageActive: Res.cat_litter_type_1_1,
      title: String.getLang('cat_litter_type_1'),
      key: 'cat_litter_type_1',
    },
    {
      image: Res.cat_litter_type_2,
      imageActive: Res.cat_litter_type_2_1,
      title: String.getLang('cat_litter_type_2'),
      key: 'cat_litter_type_2',
    },
  ];

  const handleOnSave = async () => {
    await saveDeviceCloudData('catLitterType', type);
    dispatch(actions.common.updateCloudData({ catLitterType: type }));
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
            const imageRes = isActive ? item.imageActive : item.image;
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
                <Image source={imageRes} style={styles.typeImage} />
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
        <LinearGradient
          style={[styles.buttonStyle, !type && { opacity: 0.4 }]}
          width={cx(315)}
          height={cx(50)}
        >
          <TouchableOpacity
            style={[styles.buttonViewStyle]}
            onPress={handleOnSave}
            activeOpacity={0.65}
            // disabled={!type}
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
