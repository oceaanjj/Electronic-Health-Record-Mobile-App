import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '@App/theme/ThemeContext';
import { useAuth } from '@features/Auth/AuthContext';

const APP_VERSION = '1.0.0';
const APP_NAME = 'Electronic Health Record';
const APP_MADE_BY = 'Made by BSCS-3A Students';

const DoctorSettingsScreen = ({ onNavigate }: { onNavigate: (route: string) => void }) => {
  const { theme, isDarkMode } = useAppTheme();
  const { user } = useAuth();

  const styles = useMemo(() => createStyles(theme, isDarkMode), [theme, isDarkMode]);

  const avatarInitial = user?.full_name?.charAt(0)?.toUpperCase() || 'D';

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.full_name || 'Doctor'}</Text>
            <Text style={styles.profileRole}>Doctor</Text>
            {user?.email ? <Text style={styles.profileEmail}>{user.email}</Text> : null}
          </View>
        </View>

        {/* About App */}
        <SectionHeader title="About" theme={theme} />
        <View style={styles.card}>
          <InfoRow icon="phone-android" label="App Name" value={APP_NAME} theme={theme} />
          <View style={styles.divider} />
          <InfoRow icon="info-outline" label="Version" value={`v${APP_VERSION}`} theme={theme} />
          <View style={styles.divider} />
          <InfoRow icon="school" label="Developed by" value={APP_MADE_BY} theme={theme} />
          <View style={styles.divider} />
          <InfoRow icon="person-outline" label="Your Role" value="Doctor" theme={theme} />
        </View>

        {/* Support */}
        <SectionHeader title="Support" theme={theme} />
        <View style={styles.card}>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:support@ehr.local')}>
            <InfoRow icon="email" label="Contact Support" value="support@ehr.local" theme={theme} chevron />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{APP_NAME}</Text>
          <Text style={styles.footerSub}>{APP_MADE_BY}</Text>
        </View>

      </ScrollView>

      <View style={styles.bottomNav}>
        <NavItem label="Home" icon={require('../../../../assets/doctors-page/doctor-home.png')} onPress={() => onNavigate('DoctorHome')} theme={theme} />
        <NavItem label="Patients" icon={require('../../../../assets/doctors-page/doctor-patients.png')} onPress={() => onNavigate('DoctorPatients')} theme={theme} />
        <NavItem label="Reports" icon={require('../../../../assets/doctors-page/doctor-reports.png')} onPress={() => onNavigate('DoctorReports')} theme={theme} />
        <NavItem label="Settings" icon={require('../../../../assets/doctors-page/doctor-settings.png')} active theme={theme} />
      </View>
    </SafeAreaView>
  );
};

const SectionHeader = ({ title, theme }: { title: string; theme: any }) => (
  <Text style={{ fontSize: 12, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted, marginBottom: 8, marginTop: 22, letterSpacing: 0.8 }}>
    {title.toUpperCase()}
  </Text>
);

const InfoRow = ({ icon, label, value, theme, chevron }: { icon: string; label: string; value: string; theme: any; chevron?: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }}>
    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.card2, justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
      <Icon name={icon} size={20} color={theme.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 13, fontFamily: 'AlteHaasGrotesk', color: theme.textMuted }}>{label}</Text>
      <Text style={{ fontSize: 15, fontFamily: 'AlteHaasGroteskBold', color: theme.text, marginTop: 2 }}>{value}</Text>
    </View>
    {chevron && <Icon name="chevron-right" size={20} color={theme.textMuted} />}
  </View>
);

const NavItem = ({ label, icon, active, onPress, theme }: any) => (
  <TouchableOpacity onPress={onPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <View style={[{ alignItems: 'center', justifyContent: 'center', paddingVertical: 8, width: '100%' }, active && { backgroundColor: theme.navActiveBg, borderRadius: 20 }]}>
      <Image source={icon} style={{ width: 24, height: 24, marginBottom: 4, tintColor: active ? theme.secondary : '#999' }} resizeMode="contain" />
      <Text style={{ fontSize: 10, color: active ? theme.secondary : '#999' }}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const createStyles = (theme: any, isDarkMode: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 140, paddingTop: 40 },
  header: { marginBottom: 28, marginTop: 10 },
  headerTitle: { fontSize: 35, color: '#035022', fontFamily: 'MinionPro-SemiboldItalic' },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card,
    borderRadius: 20, padding: 20, borderWidth: 1, borderColor: theme.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  avatarCircle: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#035022',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  avatarText: { color: '#FFF', fontSize: 26, fontFamily: 'AlteHaasGroteskBold' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontFamily: 'AlteHaasGroteskBold', color: theme.text },
  profileRole: { fontSize: 13, fontFamily: 'AlteHaasGrotesk', color: theme.secondary, marginTop: 2 },
  profileEmail: { fontSize: 12, fontFamily: 'AlteHaasGrotesk', color: theme.textMuted, marginTop: 2 },

  card: {
    backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  divider: { height: 1, backgroundColor: theme.border, marginHorizontal: 16 },

  footer: { alignItems: 'center', marginTop: 40 },
  footerText: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted },
  footerSub: { fontSize: 11, fontFamily: 'AlteHaasGrotesk', color: theme.textMuted, marginTop: 4 },

  bottomNav: {
    position: 'absolute', bottom: 20, left: 20, right: 20, height: 70, backgroundColor: theme.card,
    borderRadius: 35, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 10, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
  },
});

export default DoctorSettingsScreen;

export default DoctorSettingsScreen;
