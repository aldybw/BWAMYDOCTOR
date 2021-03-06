import {
  get,
  getDatabase,
  limitToLast,
  onValue,
  orderByChild,
  query,
  ref,
} from '@firebase/database';
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {ILNullPhoto} from '../../assets';
import {
  DoctorCategory,
  Gap,
  HomeProfile,
  NewsItem,
  RatedDoctor,
} from '../../components';
import {Fire} from '../../config';
import {colors, fonts, getData, showError} from '../../utils';

const Doctor = ({navigation}) => {
  const [news, setNews] = useState([]);
  const [categoryDoctor, setCategoryDoctor] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [profile, setProfile] = useState({
    photoURL: ILNullPhoto,
    fullName: '',
    profession: '',
  });
  useEffect(() => {
    getNews();
    getCategoryDoctor();
    getTopRatedDoctor();
    navigation.addListener('focus', () => {
      getUserData();
    });
  }, [navigation]);

  const getTopRatedDoctor = () => {
    const db = getDatabase(Fire);

    const topRatedDoctor = query(
      ref(db, 'doctors/'),
      orderByChild('rate'),
      limitToLast(3),
    );

    get(topRatedDoctor)
      .then(value => {
        if (value.exists()) {
          const oldData = value.val();
          const data = [];
          Object.keys(oldData).map(key => {
            data.push({
              id: key,
              data: oldData[key],
            });
          });
          setDoctors(data);
        }
      })
      .catch(error => {
        showError(error);
      });
  };

  const getCategoryDoctor = () => {
    const db = getDatabase(Fire);
    onValue(
      ref(db, 'category_doctor/'),
      value => {
        if (value.exists()) {
          const data = value.val();
          const filterData = data.filter(el => el !== null);

          setCategoryDoctor(filterData);
        }
      },
      {
        onlyOnce: true,
      },
    );
  };

  const getNews = () => {
    const db = getDatabase(Fire);
    onValue(
      ref(db, 'news/'),
      value => {
        if (value.exists()) {
          const data = value.val();
          const filterData = data.filter(el => el !== null);

          setNews(filterData);
        }
      },
      {
        onlyOnce: true,
      },
    );
  };

  const getUserData = () => {
    getData('user').then(res => {
      const data = res;
      data.photoURL =
        res?.photoURL?.length > 1 ? {uri: res.photoURL} : ILNullPhoto;
      setProfile(data);
    });
  };

  return (
    <View style={styles.page}>
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.wrapperSection}>
            <Gap height={30} />
            <HomeProfile
              profile={profile}
              onPress={() => navigation.navigate('UserProfile')}
            />
            <Text style={styles.welcome}>
              Mau konsultasi dengan siapa hari ini?
            </Text>
          </View>
          <View style={styles.wrapperScroll}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.category}>
                <Gap width={32} />
                {categoryDoctor.map(item => {
                  return (
                    <DoctorCategory
                      key={item.id}
                      category={item.category}
                      onPress={() => navigation.navigate('ChooseDoctor', item)}
                    />
                  );
                })}
                <Gap width={22} />
              </View>
            </ScrollView>
          </View>
          <View style={styles.wrapperSection}>
            <Text style={styles.sectionLabel}>Top Rated Doctors</Text>
            {doctors.map(doctor => {
              return (
                <RatedDoctor
                  key={doctor.id}
                  name={doctor.data.fullName}
                  desc={doctor.data.profession}
                  avatar={{uri: doctor.data.photo}}
                  onPress={() => navigation.navigate('DoctorProfile', doctor)}
                />
              );
            })}
            <Text style={styles.sectionLabel}>Good News</Text>
          </View>
          {news.map(item => {
            return (
              <NewsItem
                key={item.id}
                title={item.title}
                date={item.date}
                image={item.image}
              />
            );
          })}
          <Gap height={30} />
        </ScrollView>
      </View>
    </View>
  );
};

export default Doctor;

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.secondary,
    flex: 1,
  },
  content: {
    backgroundColor: colors.white,
    flex: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  wrapperSection: {paddingHorizontal: 16},
  welcome: {
    fontSize: 20,
    fontFamily: fonts.primary[600],
    color: colors.text.primary,
    marginTop: 30,
    marginBottom: 16,
    maxWidth: 209,
  },
  category: {flexDirection: 'row'},
  wrapperScroll: {marginHorizontal: -16},
  sectionLabel: {
    fontSize: 16,
    fontFamily: fonts.primary[600],
    color: colors.text.primary,
    marginTop: 30,
    marginBottom: 16,
  },
});
